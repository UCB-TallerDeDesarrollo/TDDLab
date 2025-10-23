import * as vscode from 'vscode';
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

  constructor(context: vscode.ExtensionContext, timelineView: TimelineView, terminalPort: TerminalPort) {
    this.context = context;
    this.timelineView = timelineView;
    this.terminalPort = terminalPort;

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

    webviewView.webview.html = this.getHtml(timelineHtml);

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

  // ✅ MÉTODO CORREGIDO - Ahora ejecuta el comando realmente
  public async executeCommand(command: string) {
    await this.executeRealCommand(command);
  }

  public clearTerminal() {
    this.terminalBuffer = '$ ';
    this.context.globalState.update(this.BUFFER_STORAGE_KEY, this.terminalBuffer);
    
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: 'clearTerminal'
      });
    }
  }

  // MANTENER getHtml EXACTAMENTE IGUAL
  private getHtml(timelineContent: string): string {
    const xtermCssUri = 'https://cdn.jsdelivr.net/npm/xterm/css/xterm.css';
    const xtermJsUri = 'https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js';

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Terminal TDD</title>
        <link rel="stylesheet" href="${xtermCssUri}">
        <script src="${xtermJsUri}"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            font-family: monospace;
            background: #1e1e1e;
            color: #eee;
          }
          #timeline {
            flex: 0 0 auto;
            background-color: #222;
            color: #eee;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #444;
          }
          #timeline-content {
            display: flex;
            text-align: left;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
          }
          .timeline-dot {
            display: inline-block;
          }
          #terminal {
            flex: 1 1 auto;
            text-align: left;
            width: 100%;
            height: 100%;
            overflow: hidden;
            padding: 0;
            margin: 0;
          }
          .xterm {
            width: 100% !important;
            height: 100% !important;
            text-align: left !important;
            padding: 10px !important;
            box-sizing: border-box !important;
          }
          .xterm-viewport {
            width: 100% !important;
            text-align: left !important;
          }
          .xterm-screen {
            width: 100% !important;
            text-align: left !important;
          }
          .xterm-rows {
            text-align: left !important;
            width: 100% !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
          }
          .xterm-row {
            text-align: left !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
          }
          .xterm-char {
            text-align: left !important;
          }
          #terminal > div {
            text-align: left !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
          }
          .terminal-wrapper {
            width: 100%;
            height: 100%;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div id="timeline">
          <h2>TDDLab Timeline</h2>
          <div id="timeline-content">${timelineContent}</div>
        </div>

        <div class="terminal-wrapper">
          <div id="terminal"></div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          
          const term = new Terminal({ 
            cursorBlink: true,
            cols: 80,
            rows: 30,
            theme: {
              background: '#1e1e1e',
              foreground: '#ffffff'
            },
            allowTransparency: false,
            convertEol: true
          });
          
          const terminalElement = document.getElementById('terminal');
          term.open(terminalElement);
          
          setTimeout(() => {
            const xtermRows = terminalElement.querySelector('.xterm-rows');
            if (xtermRows) {
              xtermRows.style.textAlign = 'left';
              xtermRows.style.paddingLeft = '0';
              xtermRows.style.marginLeft = '0';
              xtermRows.style.width = '100%';
            }
            
            const xtermScreen = terminalElement.querySelector('.xterm-screen');
            if (xtermScreen) {
              xtermScreen.style.textAlign = 'left';
              xtermScreen.style.paddingLeft = '0';
              xtermScreen.style.marginLeft = '0';
            }
          }, 100);
          
          const fitAddon = () => {
            const container = document.querySelector('.terminal-wrapper');
            if (container) {
              const width = container.offsetWidth;
              const height = container.offsetHeight;
              const cols = Math.floor((width - 20) / 9);
              const rows = Math.floor(height / 17);
              term.resize(cols, rows);
            }
          };
          
          window.addEventListener('resize', fitAddon);
          setTimeout(fitAddon, 200);
          
          term.focus();
          
          let command = '';
          let isExecuting = false;

          term.onData(data => {
            const code = data.charCodeAt(0);
            if (code === 13) {
              if (command.trim() && !isExecuting) {
                isExecuting = true;
                vscode.postMessage({
                  command: 'executeCommand',
                  text: command
                });
                command = '';
              } else if (!isExecuting) {
                term.write('\\r\\n$ ');
              }
            } else if (code === 127) {
              if (command.length > 0 && !isExecuting) {
                command = command.slice(0, -1);
                term.write('\\b \\b');
              }
            } else if (code === 3) {
              // Ctrl+C - siempre funciona
              term.write('^C');
              vscode.postMessage({
                command: 'killCommand'
              });
              isExecuting = false;
              term.write('\\r\\n$ ');
            } else if (code >= 32 && code <= 126 && !isExecuting) {
              command += data;
              term.write(data);
            }
          });
          
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateTimeline') {
              document.getElementById('timeline-content').innerHTML = message.html;
            }
            if (message.command === 'writeToTerminal') {
              const text = message.text || '';
              term.write(text);
              if (message.text === '$ ' || message.text.endsWith('\\r\\n$ ')) {
                isExecuting = false;
              }
            }
            if (message.command === 'executeCommand') {
              term.write('\\r\\n$ ' + message.text + '\\r\\n');
              isExecuting = true;
            }
            if (message.command === 'clearTerminal') {
              term.clear();
              term.write('$ ');
              isExecuting = false;
              command = '';
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}