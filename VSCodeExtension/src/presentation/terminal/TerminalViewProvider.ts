import * as vscode from 'vscode';
import { TimelineView } from '../timeline/TimelineView';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { TerminalHtml } from './components/TerminalHtml';
import { TerminalCss } from './components/TerminalCss';
import { TerminalScript } from './components/TerminalScript';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';
  
  private webviewView?: vscode.WebviewView;
  private terminalBuffer: string = '';
  private readonly BUFFER_STORAGE_KEY = 'tddTerminalBuffer';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly timelineView: TimelineView,
    private readonly terminalPort: TerminalPort
  ) {
    this.terminalBuffer = context.globalState.get(this.BUFFER_STORAGE_KEY, '');
    
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

    const timelineHtml = await this.getTimelineHtml();
    const html = TerminalHtml.generate(
      timelineHtml,
      TerminalCss.getStyles(),
      TerminalScript.getCode()
    );

    webviewView.webview.html = html;
    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.handleWebviewMessage(message);
    });

    // Restaurar contenido o mostrar bienvenida
    if (this.terminalBuffer && this.terminalBuffer.trim() !== '' && this.terminalBuffer !== '$ ') {
      this.sendToTerminal(this.terminalBuffer, true);
    } else {
      this.sendToTerminal('\r\nBienvenido a la Terminal TDD\r\n$ ');
    }

    // Actualizar timeline después de inicializar
    setTimeout(async () => {
      await this.updateTimelineInWebview();
    }, 500);

    console.log('[TerminalViewProvider] Webview inicializada ✅');
  }

  private async getTimelineHtml(): Promise<string> {
    try {
      return this.webviewView ? 
        await this.timelineView.getTimelineHtml(this.webviewView.webview) : 
        '<p style="color: gray;">Timeline no disponible 🚨</p>';
    } catch (err) {
      console.error('[TerminalViewProvider] Error cargando timeline:', err);
      return '<p style="color: gray;">Timeline no disponible 🚨</p>';
    }
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
      this.showHelp();
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

  private showHelp(): void {
    const helpText = `\r
┌───[TDDLab - Comandos]─────────────────────────────┐\r
│                                                   │\r
│  Comandos locales:                                │\r
│    clear     - Limpiar terminal                   │\r
│    help, ?   - Mostrar esta ayuda                 │\r
│                                                   │\r
│  Comandos del sistema:                            │\r
│    Cualquier comando se ejecuta en tiempo real    │\r
│    y muestra la salida directamente aquí          │\r
│                                                   │\r
│  Control:                                         │\r
│    Ctrl+C    - Cancelar comando en ejecución      │\r
│                                                   │\r
│  Ejemplos:                                        │\r
│    npm test  - Ejecutar tests                     │\r
│    git status - Estado de Git                     │\r
│    ls -la    - Listar archivos                    │\r
│    pwd       - Directorio actual                  │\r
│                                                   │\r
└───────────────────────────────────────────────────┘\r
\r\n$ `;

    this.sendToTerminal(helpText);
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
    }
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
        this.sendToTerminal('$ ');
      }, 100);
    }
  }
}