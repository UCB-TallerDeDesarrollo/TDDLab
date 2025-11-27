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

    this.terminalBuffer = context.globalState.get(this.BUFFER_STORAGE_KEY, '');

    this.terminalPort.setOnOutputCallback((output: string) => {
      this.sendToTerminal(output);
    });

    if (typeof (TimelineView as any).onTimelineUpdated === 'function') {
      (TimelineView as any).onTimelineUpdated(async () => {
        await this.updateTimelineInWebview();
      });
    }
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;
    webviewView.webview.options = { enableScripts: true };

    let timelineHtml = '<p style="color: gray;">Timeline no disponible 🚨</p>';
    try {
      timelineHtml = await this.timelineView.getTimelineHtml(webviewView.webview);
    } catch (err) {
      console.error('[TerminalViewProvider] Error cargando timeline:', err);
    }

    webviewView.webview.html = await this.getHtml(webviewView.webview, timelineHtml);
    
    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.handleWebviewMessage(message);
    });

    if (this.terminalBuffer && this.terminalBuffer.trim() !== '' && this.terminalBuffer !== '$ ') {
      this.webviewView?.webview.postMessage({
        command: 'writeToTerminal',
        text: this.terminalBuffer
      });
    } else {
      this.sendToTerminal('\r\nBienvenido a la Terminal TDD\r\n$ ');
    }

    setTimeout(async () => {
      await this.updateTimelineInWebview();
    }, 500);

    console.log('[TerminalViewProvider] Webview inicializada ✅');
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
      
      default:
        console.warn(`Comando no reconocido: ${message.command}`);
    }
  }

  private async executeRealCommand(command: string): Promise<void> {
   if (!command.trim()) {
  const currentDir = process.cwd();
this.sendToTerminal(`${currentDir}> ${command}\n`);
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

    this.sendToTerminal(`\r\n$ ${trimmedCommand}\r\n`);

    try {
      await this.terminalPort.createAndExecuteCommand('TDDLab Terminal', trimmedCommand);
    } catch (error: any) {
      this.sendToTerminal(`❌ Error ejecutando comando: ${error.message}\r\n$ `);
    }
  }

  private killCurrentCommand(): void {
    this.terminalPort.killCurrentProcess();
  }

  private async showHelp(): Promise<void> {
    if (!this.helpTextCache) {
      try {
        const helpPath = path.join(this.TEMPLATE_DIR, 'TerminalHelp.txt');
        const helpContent = await fs.readFile(helpPath, 'utf-8');

        this.helpTextCache = helpContent + '\r\n$ ';  
      } catch (error) {
        console.error('Error cargando TerminalHelp.txt:', error);
        this.helpTextCache = '\r\n❌ Error al cargar la ayuda.\r\n$ ';
      }
    }
    this.sendToTerminal(this.helpTextCache, false, true);
  }

  private async updateTimelineInWebview() {
    if (this.webviewView) {
      try {
        const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
        this.webviewView.webview.postMessage({
          command: 'updateTimeline',
          html: newTimelineHtml
        });
      } catch (error) {
        console.error('[TerminalViewProvider] Error actualizando timeline:', error);
      }
    }
  }

  public sendToTerminal(message: string, isRestoring: boolean = false, skipColorize: boolean = false) {
    // Colorizar automáticamente según palabras clave
    let coloredMessage = skipColorize ? message : this.colorizeTestOutput(message);
    if (!isRestoring) {
      this.terminalBuffer += coloredMessage;
      this.context.globalState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);
    }
    
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'writeToTerminal',
        text: coloredMessage
      });
    }
  }

  private colorizeTestOutput(text: string): string {
  // Códigos ANSI para colores
  const RED = '\x1b[31m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const BRIGHT_RED = '\x1b[91m';
  const BRIGHT_GREEN = '\x1b[92m';
  const RESET = '\x1b[0m';
  
  let result = text;
  
  //  Colorear "Test Suites: X failed, Y total"
  result = result.replace(/(Test Suites:)\s+(\d+)\s+(failed)/gi, 
    `$1 ${BRIGHT_RED}$2 $3${RESET}`);
  
  //  Colorear "Tests: X failed, Y passed, Z total"
  result = result.replace(/(Tests:)\s+(\d+)\s+(failed),\s+(\d+)\s+(passed)/gi, 
    `$1 ${BRIGHT_RED}$2 $3${RESET}, ${BRIGHT_GREEN}$4 $5${RESET}`);
  
  // Colorear solo "X passed" (cuando no hay failed)
  result = result.replace(/(Tests:)\s+(\d+)\s+(passed)/gi, 
    `$1 ${BRIGHT_GREEN}$2 $3${RESET}`);
  
  //  Colorear solo "X failed" (cuando no hay passed)
  result = result.replace(/(Tests:)\s+(\d+)\s+(failed)/gi, 
    `$1 ${BRIGHT_RED}$2 $3${RESET}`);
  
  //  Colorear líneas completas "PASS"
  result = result.replace(/(PASS\s+[^\n]+)/g, `${GREEN}$1${RESET}`);
  
  // Colorear líneas completas "FAIL"
  result = result.replace(/(FAIL\s+[^\n]+)/g, `${RED}$1${RESET}`);
  
  //  Detectar símbolos de éxito
  result = result.replace(/(✓|✔)/g, `${GREEN}$1${RESET}`);
  
  //  Detectar símbolos de error
  result = result.replace(/(✗|✘)/g, `${RED}$1${RESET}`);
  
  // Colorear "Expected" y "Received"
  result = result.replace(/(Expected|Received):/gi, `${RED}$1:${RESET}`);
  
  //  Colorear errores
  result = result.replace(/(Error:|Error at)/gi, `${RED}$1${RESET}`);
  
  //  Colorear "Snapshots: X total"
  result = result.replace(/(Snapshots:)\s+(\d+)\s+(total)/gi, 
    `$1 ${YELLOW}$2 $3${RESET}`);
  
  //  Colorear tiempo de ejecución
  result = result.replace(/(Time:)\s+([0-9.]+\s*s)/gi, 
    `$1 ${YELLOW}$2${RESET}`);
  
  return result;
}

  public async executeCommand(command: string) {
    await this.executeRealCommand(command);
  }

  public clearTerminal() {
    this.terminalBuffer = '';
    this.context.globalState.update(this.BUFFER_STORAGE_KEY, '');
    
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'clearTerminal'
      });
      setTimeout(() => {
        const currentDir = process.cwd();   
    this.sendToTerminal(`${currentDir}> `);
      }, 100);
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