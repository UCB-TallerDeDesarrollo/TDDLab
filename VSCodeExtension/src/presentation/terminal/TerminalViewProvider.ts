import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises'; // Usar fs/promises para async/await
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

    // Cargar buffer persistido
    this.terminalBuffer = context.globalState.get(this.BUFFER_STORAGE_KEY, '');

    // Configurar callback directo para el output
    this.terminalPort.setOnOutputCallback((output: string) => {
      this.sendToTerminal(output);
    });

    // Timeline updates si existe
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

    // Restaurar el contenido de la terminal
    if (this.terminalBuffer && this.terminalBuffer.trim() !== '' && this.terminalBuffer !== '$ ') {
      // Enviar el buffer completo de una vez
      this.webviewView?.webview.postMessage({
        command: 'writeToTerminal',
        text: this.terminalBuffer
      });
    } else {
      // Primera vez: mensaje de bienvenida
      this.sendToTerminal('\r\nBienvenido a la Terminal TDD\r\n$ ');
    }

    // Actualizar el timeline después de restaurar la terminal
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
      this.sendToTerminal('$ ');
      return;
    }

    const trimmedCommand = command.trim();
    
    // Comandos locales
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
        this.helpTextCache = await fs.readFile(helpPath, 'utf-8');
      } catch (error) {
        console.error('Error cargando TerminalHelp.txt:', error);
        this.helpTextCache = '\r\n❌ Error al cargar la ayuda.\r\n$ ';
      }
    }
    this.sendToTerminal(this.helpTextCache);
  }

  private async updateTimelineInWebview() {
    if (this.webviewView) {
      try {
        const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
        // Actualizar SOLO el Timeline, sin tocar el buffer de la terminal
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
    // NO guardar en buffer si es para restaurar
    if (!isRestoring) {
      this.terminalBuffer += message;
      this.context.globalState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);
    }
    
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'writeToTerminal',
        text: message
      });
    }
  }

  public async executeCommand(command: string) {
    await this.executeRealCommand(command);
  }

  public clearTerminal() {
    // Limpiar completamente el buffer
    this.terminalBuffer = '';
    this.context.globalState.update(this.BUFFER_STORAGE_KEY, '');
    
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'clearTerminal'
      });
      // Después de limpiar, enviar el prompt inicial
      setTimeout(() => {
        this.sendToTerminal('$ ');
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