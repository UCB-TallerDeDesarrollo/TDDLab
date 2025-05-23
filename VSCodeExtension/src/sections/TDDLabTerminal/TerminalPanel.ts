import * as vscode from 'vscode';

export class TerminalPanel {
  private static panel: vscode.WebviewPanel | undefined;

  public static show(context: vscode.ExtensionContext) {
    if (TerminalPanel.panel) {
      TerminalPanel.panel.reveal();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'simulatedTerminal',
      'Terminal Simulada',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    panel.webview.html = TerminalPanel.getHtmlForWebview();
    TerminalPanel.panel = panel;

    panel.onDidDispose(() => {
      TerminalPanel.panel = undefined;
    });
  }

  private static getHtmlForWebview(): string {
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
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: black;
            color: white;
            font-family: monospace;
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
