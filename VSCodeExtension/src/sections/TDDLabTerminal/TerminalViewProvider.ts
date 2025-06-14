import * as vscode from 'vscode';
import { TimelineView } from '../Timeline/TimelineView';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';
  private readonly context: vscode.ExtensionContext;
  private readonly timelineView: TimelineView;
  private webviewView?: vscode.WebviewView;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.timelineView = new TimelineView(context);
    
    // Suscribirse a los cambios del timeline
    TimelineView.onTimelineUpdated(async (timelineData) => {
      await this.updateTimelineInWebview();
    });
  }

  async resolveWebviewView(
      webviewView: vscode.WebviewView,
      _context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken
  ) {
      this.webviewView = webviewView;
      
      webviewView.webview.options = {
          enableScripts: true
      };

      // Obtiene el HTML del timeline usando el webview actual
      const timelineHtml = await this.timelineView.getTimelineHtml(webviewView.webview);

      // Inyecta el timeline y la terminal en la misma webview
      webviewView.webview.html = this.getHtml(timelineHtml, webviewView.webview);
      
      // Manejar cuando la webview se vuelve visible (importante para cuando se cambia de terminal)
      webviewView.onDidChangeVisibility(() => {
        if (webviewView.visible) {
          console.log('[TerminalViewProvider] Webview visible, actualizando timeline...');
          this.refreshTimelineOnVisible();
        }
      });

      // Manejar mensajes desde la webview
      webviewView.webview.onDidReceiveMessage(async (message) => {
          if (message.command === 'requestTimelineUpdate') {
              console.log('[TerminalViewProvider] Webview solicita actualización de timeline');
              await this.updateTimelineInWebview();
          }
      });

      console.log('[TerminalViewProvider] Webview inicializada y suscrita a cambios');
  }

  private async refreshTimelineOnVisible() {
      if (this.webviewView && this.webviewView.visible) {
          try {
              setTimeout(async () => {
                  const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView!.webview);
                  
                  this.webviewView!.webview.postMessage({
                      command: 'updateTimeline',
                      html: newTimelineHtml
                  });
                  
                  console.log('[TerminalViewProvider] Timeline refrescado al volverse visible');
              }, 100);
          } catch (error) {
              console.error('[TerminalViewProvider] Error refrescando timeline:', error);
          }
      }
  }

  private async updateTimelineInWebview() {
    if (this.webviewView) {
        try {
            const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
            
            // Enviar mensaje a la webview para actualizar solo el timeline
            this.webviewView.webview.postMessage({
                command: 'updateTimeline',
                html: newTimelineHtml
            });
            
            console.log('[TerminalViewProvider] Timeline actualizado en terminal');
        } catch (error) {
            console.error('[TerminalViewProvider] Error actualizando timeline:', error);
        }
    }
  }

  private getHtml(timelineContent: string, webview: vscode.Webview): string {
    const xtermCssUri = 'https://cdn.jsdelivr.net/npm/xterm/css/xterm.css';
    const xtermJsUri = 'https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js';

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Terminal + Timeline</title>
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
          }
          #timeline {
            flex: 0 0 auto;
            background-color: #222;
            color: #eee;
            padding: 10px;
            overflow-x: auto;
          }
          #terminal {
            flex: 1 1 auto;
          }
          .timeline-dot {
            position: relative;
            display: inline-block;
            margin: 3px;
          }
          .popup {
            display: none;
            position: absolute;
            background: #333;
            color: white;
            padding: 5px;
            border-radius: 5px;
            z-index: 100;
          }
          .timeline-dot:hover .popup {
            display: block;
          }
        </style>
      </head>
      <body>
        <div id="timeline">
          <h2>TDDLab Timeline</h2>
          <div id="timeline-content" style="display: flex; flex-wrap: wrap;">
            ${timelineContent}
          </div>
        </div>

        <div id="terminal"></div>

        <script>
          const term = new Terminal({ cursorBlink: true });
          term.open(document.getElementById('terminal'));

          const prompt = () => term.write('\\r\\n$ ');
          let command = '';

          term.write('Bienvenido a la terminal simulada. Escribe "help" para ver comandos.');
          prompt();

          // Escuchar mensajes del extension host para actualizar el timeline
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateTimeline') {
              const timelineContent = document.getElementById('timeline-content');
              if (timelineContent) {
                timelineContent.innerHTML = message.html;
                console.log('[Terminal WebView] Timeline actualizado');
              }
            }
          });

          // Solicitar actualización del timeline cuando la página se carga
          window.addEventListener('load', () => {
            console.log('[Terminal WebView] Página cargada, solicitando timeline actual...');
            // Pequeño delay para asegurar que todo esté inicializado
            setTimeout(() => {
              const vscode = acquireVsCodeApi();
              vscode.postMessage({ command: 'requestTimelineUpdate' });
            }, 500);
          });

          // También solicitar cuando el documento esté listo
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              const vscode = acquireVsCodeApi();
              vscode.postMessage({ command: 'requestTimelineUpdate' });
            });
          } else {
            // Ya está cargado
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'requestTimelineUpdate' });
          }

          term.onData(data => {
            const code = data.charCodeAt(0);
            if (code === 13) {
              handleCommand(command.trim());
              command = '';
            } else if (code === 127) {
              if (command.length > 0) {
                command = command.slice(0, -1);
                term.write('\\b \\b');
              }
            } else if (code >= 32 && code <= 126) {
              command += data;
              term.write(data);
            }
          });

          function handleCommand(cmd) {
            switch (cmd) {
              case 'help':
                term.write('\\r\\nComandos disponibles: help, clear, echo, about, timeline, refresh');
                break;
              case 'clear':
                term.clear();
                break;
              case 'about':
                term.write('\\r\\nEsta es una consola simulada hecha con xterm.js');
                break;
              case 'timeline':
                term.write('\\r\\nTimeline sincronizado automáticamente con la vista principal');
                break;
              case 'refresh':
                term.write('\\r\\nSolicitando actualización del timeline...');
                const vscode = acquireVsCodeApi();
                vscode.postMessage({ command: 'requestTimelineUpdate' });
                break;
              case '':
                break;
              default:
                if (cmd.startsWith('echo ')) {
                  term.write('\\r\\n' + cmd.slice(5));
                } else {
                  term.write('\\r\\nComando no reconocido: ' + cmd + '. Escribe "help" para ver comandos disponibles.');
                }
                break;
            }
            prompt();
          }
        </script>
      </body>
      </html>
    `;
  }
}