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

    // Callback para cuando el comando termina, para mostrar el prompt de nuevo
    this.terminalPort.setOnCommandCompleteCallback(() => {
        this.sendToTerminal(this.getPrompt());
    });

    if (typeof (TimelineView as any).onTimelineUpdated === 'function') {
      (TimelineView as any).onTimelineUpdated(async () => {
        await this.updateTimelineInWebview();
      });
    }
  }

  public getPrompt(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!workspaceFolder) {
      return "\r\nPS C:\\> ";
    }

    return `\r\nPS ${workspaceFolder}> `;
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this.terminalBuffer = '';
    this.context.globalState.update(this.BUFFER_STORAGE_KEY, '');

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

    // Enviar configuración inicial a la webview
    this.sendTerminalConfig();

    // Mostrar mensaje de bienvenida y el primer prompt
    this.sendToTerminal(`Bienvenido a la Terminal TDD`);
    this.sendToTerminal(this.getPrompt());


    setTimeout(async () => {
      await this.updateTimelineInWebview();
    }, 500);

    console.log('[TerminalViewProvider] Webview inicializada ✅');
  }

  private sendTerminalConfig() {
      if (!this.webviewView) return;

      const config = vscode.workspace.getConfiguration('terminal.integrated');
      const theme = vscode.window.activeColorTheme;

      this.webviewView.webview.postMessage({
          command: 'setTerminalConfig',
          config: {
              fontFamily: config.get('fontFamily') || 'monospace',
              fontSize: config.get('fontSize') || 14,
              fontWeight: config.get('fontWeight') || 'normal',
              theme: {
                  background: 'var(--vscode-terminal-background)',
                  foreground: 'var(--vscode-terminal-foreground)',
                  cursor: 'var(--vscode-terminalCursor-foreground)',
                  selection: 'var(--vscode-terminal-selectionBackground)',
              }
          }
      });
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
    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      this.sendToTerminal(this.getPrompt());
      return;
    }

    if (trimmedCommand === 'clear') {
      this.clearTerminal();
      return;
    }

    if (trimmedCommand === 'help' || trimmedCommand === '?') {
      await this.showHelp();
      this.sendToTerminal(this.getPrompt());
      return;
    }

    // El prompt ya se muestra a través del callback onCommandComplete
    try {
      await this.terminalPort.createAndExecuteCommand('TDDLab Terminal', trimmedCommand);
    } catch (error: any) {
      this.sendToTerminal(`❌ Error ejecutando comando: ${error.message}`);
      this.sendToTerminal(this.getPrompt());
    }
  }

  private killCurrentCommand(): void {
    this.terminalPort.killCurrentProcess();
  }

  private async showHelp(): Promise<void> {
    if (!this.helpTextCache) {
      try {
        const helpPath = path.join(this.TEMPLATE_DIR, 'TerminalHelp.txt');
        this.helpTextCache = await fs.readFile(helpPath, 'utf-8');
      } catch (error) {
        console.error('Error cargando TerminalHelp.txt:', error);
        this.helpTextCache = `\r\n❌ Error al cargar la ayuda.`;
      }
    }
    this.sendToTerminal(this.helpTextCache);
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

  public sendToTerminal(message: string, isRestoring: boolean = false) {
    if (!isRestoring) {
      this.terminalBuffer += message;
      this.context.globalState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);
    }

    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'writeToTerminal',
        text: message
      });

      // Forzar el scroll hacia abajo en la webview
      this.webviewView.webview.postMessage({
        command: 'scrollToBottom'
      });
    }
  }

  public async executeCommand(command: string) {
    // Escribimos el comando en la terminal para simular que el usuario lo escribió
    this.sendToTerminal(`${this.getPrompt()}${command}\r\n`);
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
        this.sendToTerminal(this.getPrompt());
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
