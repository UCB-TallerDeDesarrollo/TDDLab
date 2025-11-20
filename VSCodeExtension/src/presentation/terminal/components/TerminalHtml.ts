export class TerminalHtml {
    static generate(timelineContent: string, css: string, script: string): string {
        return /* html */ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TDDLab Terminal</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css">
            <style>${css}</style>
        </head>
        <body>
            <div id="timeline">
            <h2>TDDLab Timeline</h2>
            <div id="timeline-content">${timelineContent}</div>
            </div>

            <div class="terminal-wrapper">
            <div id="terminal"></div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
            <script>${script}</script>
        </body>
        </html>
        `;
    }
    }