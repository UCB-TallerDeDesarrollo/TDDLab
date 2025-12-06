import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { TimelineView } from '../timeline/TimelineView';
import { TerminalPort } from '../../domain/model/TerminalPort';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';
  private readonly context: vscode.ExtensionContext;
  private webviewView?: vscode.WebviewView;
  private readonly timelineView: TimelineView;
  private readonly terminalPort: TerminalPort;
  private terminalBuffer: string = '';

  private readonly BUFFER_STORAGE_KEY = 'tddTerminalBuffer';
  private readonly TEMPLATE_DIR: string;
  private helpTextCache: string | undefined;

  constructor(context: vscode.ExtensionContext, timelineView: TimelineView, terminalPort: TerminalPort) {
    this.context = context;
    this.timelineView = timelineView;
    this.terminalPort = terminalPort;

    this.TEMPLATE_DIR = path.join(this.context.extensionPath, 'src', 'presentation', 'terminal', 'templates');

    this.terminalBuffer = context.workspaceState.get(this.BUFFER_STORAGE_KEY, '');

    this.terminalPort.setOnOutputCallback((output: string) => {
      
      this.sendToTerminal(output);      
      if (this.isTestOutput(output)) {
          (this.timelineView as any).forceTimelineUpdate();
      }
    });

    TimelineView.onTimelineUpdated(async () => {
      await this.updateTimelineInWebview();
    });
  }

  private isTestOutput(output: string): boolean {
      return /(PASS|FAIL|Tests:|Test Suites:|✓|✕)/i.test(output);
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;

    webviewView.webview.options = { enableScripts: true };
    (webviewView as any).webview.options = {
        ...webviewView.webview.options,
        retainContextWhenHidden: true
    };

    let timelineHtml = '<p style="color: gray;">Timeline no disponible</p>';
    try {
      timelineHtml = await this.timelineView.getTimelineHtml(webviewView.webview);
    } catch {}

    webviewView.webview.html = await this.getHtml(webviewView.webview, timelineHtml);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.handleWebviewMessage(message);
    });

    if (this.terminalBuffer && this.terminalBuffer.trim() !== '' && this.terminalBuffer !== '> ') {
      this.webviewView?.webview.postMessage({
        command: 'writeToTerminal',
        text: this.terminalBuffer
      });
    } else {
      const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();
      this.sendToTerminal(`\r\nBienvenido a la Terminal TDD\r\n${cwd}> `);
    }

    setTimeout(async () => {
      await this.updateTimelineInWebview();
    }, 400);
  }

  private async handleWebviewMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'executeCommand':
        await this.executeRealCommand(message.text);
        break;

      case 'requestTimelineUpdate':
        await this.updateTimelineInWebview();
        break;

      case 'killCommand':
        this.killCurrentCommand();
        break;

      case 'requestPrompt':
        const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();
        this.sendToTerminal(`${cwd}> `);
        break;
      case 'terminalInput':
        this.terminalPort.writeToTerminal?.(message.data);
        break;
    }
    
  }

  private async executeRealCommand(command: string): Promise<void> {
    if (!command.trim()) {
      const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();
      this.sendToTerminal(`${cwd}> `);
      return;
    }

    const trimmedCommand = command.trim();

    if (trimmedCommand === 'clear') {
      this.clearTerminal();
      return;
    }

    if (trimmedCommand === 'help' || trimmedCommand === '?') {
      await this.showHelp();
      return;
    }

    this.sendToTerminal('\r\n');

    try {
      await this.terminalPort.createAndExecuteCommand('TDDLab Terminal', trimmedCommand);
    } catch (error: any) {
       this.sendToTerminal(`❌ Error ejecutando comando: ${error.message}\r\n`);
    const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();
    this.sendToTerminal(`${cwd}> `);
    }
  }

  public async executeCommand(command: string) {
      await this.executeRealCommand(command);
  }

  private killCurrentCommand(): void {
    this.terminalPort.killCurrentProcess();
  }

  private async showHelp(): Promise<void> {
    const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();

    if (!this.helpTextCache) {
      try {
        const helpPath = path.join(this.TEMPLATE_DIR, 'TerminalHelp.txt');
        const helpContent = await fs.readFile(helpPath, 'utf-8');
        this.helpTextCache = helpContent;
      } catch {
        this.helpTextCache = '\r\n❌ Error al cargar la ayuda.\r\n> ';
      }
    }

    this.sendToTerminal(this.helpTextCache + `\r\n${cwd}> `, false, true);
  }

  private async updateTimelineInWebview() {
    if (!this.webviewView) return;

    try {
      const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
      this.webviewView.webview.postMessage({
        command: 'updateTimeline',
        html: newTimelineHtml
      });
    } catch {}
  }

  public sendToTerminal(message: string, isRestoring: boolean = false, skipColorize: boolean = false) {
    let coloredMessage = skipColorize ? message : this.colorizeTestOutput(message);

    if (!isRestoring) {
      this.terminalBuffer += coloredMessage;
      this.context.workspaceState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);
    }

    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'writeToTerminal',
        text: coloredMessage
      });
    }
  }

  private colorizeTestOutput(text: string): string {
    const RED = '\x1b[31m';
    const GREEN = '\x1b[32m';
    const YELLOW = '\x1b[33m';
    const BRIGHT_RED = '\x1b[91m';
    const BRIGHT_GREEN = '\x1b[92m';
    const RESET = '\x1b[0m';

    let result = text;

    result = result.replaceAll(/(Test Suites:)\s+(\d+)\s+(failed)/gi,
      `$1 ${BRIGHT_RED}$2 $3${RESET}`);

    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(failed),\s+(\d+)\s+(passed)/gi,
      `$1 ${BRIGHT_RED}$2 $3${RESET}, ${BRIGHT_GREEN}$4 $5${RESET}`);

    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(passed)/gi,
      `$1 ${BRIGHT_GREEN}$2 $3${RESET}`);

    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(failed)/gi,
      `$1 ${BRIGHT_RED}$2 $3${RESET}`);

    result = result.replaceAll(/(PASS\s+[^\n]+)/g, `${GREEN}$1${RESET}`);
    result = result.replaceAll(/(FAIL\s+[^\n]+)/g, `${RED}$1${RESET}`);

    result = result.replaceAll(/([✓|✔])/g, `${GREEN}$1${RESET}`);
    result = result.replaceAll(/([✗|✘])/g, `${RED}$1${RESET}`);

    result = result.replaceAll(/(Expected|Received):/gi, `${RED}$1:${RESET}`);

    result = result.replaceAll(/(Error:|Error at)/gi, `${RED}$1${RESET}`);

    result = result.replaceAll(/(Snapshots:)\s+(\d+)\s+(total)/gi,
      `$1 ${YELLOW}$2 $3${RESET}`);

    result = result.replaceAll(/(Time:)\s+([0-9.]+\s*s)/gi,
      `$1 ${YELLOW}$2${RESET}`);

    return result;
  }

  public clearTerminal() {
    const cwd = (this.terminalPort as any).getCurrentDirectory?.() || process.cwd();
    const promptWithPath = `${cwd}> `;

    this.terminalBuffer = promptWithPath;
    this.context.workspaceState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);

    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'clearTerminal',
        prompt: promptWithPath
      });
    }
  }

  private async getHtml(webview: vscode.Webview, timelineContent: string): Promise<string> {
    const htmlPath = path.join(this.TEMPLATE_DIR, 'TerminalViewHTML.html');
    const cssPath = path.join(this.TEMPLATE_DIR, 'TerminalViewCSS.css');

    let htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));

    htmlContent = htmlContent.replace('{{timelineContent}}', timelineContent);
    htmlContent = htmlContent.replace('{{cssUri}}', cssUri.toString());

    return htmlContent;
  }
}