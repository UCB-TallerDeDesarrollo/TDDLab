import * as vscode from 'vscode';
import { Terminal } from 'xterm';
import { TimelineView } from '../Timeline/TimelineView';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';
  private readonly context: vscode.ExtensionContext;
  private readonly timelineView: TimelineView;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.timelineView = new TimelineView(context);
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true
    };

    const timelineHtml = await this.timelineView.getTimelineHtml(webviewView.webview);
    webviewView.webview.html = this.getHtml(timelineHtml);
  }

  private getHtml(timelineContent: string): string {
    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Terminal + Timeline</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css" />
        <script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
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
            flex: 1;
            background-color: #222;
            color: #eee;
            padding: 10px;
            overflow-y: auto;
          }
          #terminal {
            flex: 1;
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
          <div style="display: flex; flex-wrap: wrap;">
            ${timelineContent}
          </div>
        </div>

        <div id="terminal"></div>

        <script>
          const term = new Terminal({ cursorBlink: true });
          term.open(document.getElementById('terminal'));

          const prompt = () => term.write('\\r\\n$ ');
          let command = '';

          term.write('Bienvenido a la terminal simulada. Escribe \"help\" para ver comandos.');
          prompt();

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
                term.write('\\r\\nComandos disponibles: help, clear, echo, about');
                break;
              case 'clear':
                term.clear();
                break;
              case 'about':
                term.write('\\r\\nEsta es una consola simulada hecha con xterm.js');
                break;
              case '':
                break;
              default:
                if (cmd.startsWith('echo ')) {
                  term.write('\\r\\n' + cmd.slice(5));
                } else {
                  term.write('\\r\\nComando no reconocido: ' + cmd);
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
