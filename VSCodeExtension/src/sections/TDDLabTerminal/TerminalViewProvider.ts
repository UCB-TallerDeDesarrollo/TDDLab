import * as vscode from 'vscode';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Terminal Simulada</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css" />
        <script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
        <style>
          html, body, #terminal {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: black;
            color: white;
          }
        </style>
      </head>
      <body>
        <div id="terminal"></div>
        <script>
          const term = new Terminal({ cursorBlink: true });
          term.open(document.getElementById('terminal'));

          const prompt = () => term.write('\\r\\n$ ');
          let command = '';

          term.write('Bienvenido a la terminal simulada. Escribe "help" para ver comandos.');
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
