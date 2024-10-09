// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    const timelineViewProvider = new TimelineViewProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineViewProvider)
    );

    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');

        if (timelineViewProvider.currentWebview) {
            timelineViewProvider.showTimeline(timelineViewProvider.currentWebview);
        }
    });
}

class TimelineViewProvider implements vscode.WebviewViewProvider {
    private context: vscode.ExtensionContext;
    public currentWebview: vscode.Webview | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = {
            enableScripts: true
        };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }

    showTimeline(webview: vscode.Webview): void {
        var jsonData = [
            { color: "rojo", time: "2024-09-17" },
            { color: "verde", time: "2024-09-18" },
            { color: "rojo", time: "2024-09-19" },
            { color: "verde", time: "2024-09-22" },
            { color: "rojo", time: "2024-09-21" },
            { color: "verde", time: "2024-09-22" }
        ];
        webview.html = getWebviewContent(jsonData);
    }
}

function getWebviewContent(jsonData: { color: string; time: string }[]): string {
    vscode.window.showInformationMessage('Vista web recargada correctamente.');
    const timelineHtml = jsonData.map(item => {
        const color = item.color === "rojo" ? "red" : "green";
        return `<div style="margin: 10px; background-color: ${color}; width: 30px; height: 30px;"></div>`;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Línea de Tiempo</title>
        </head>
        <body>
            <h1>Línea de Tiempo</h1>
            <div style="display:flex;">
                ${timelineHtml}
            </div>
        </body>
        </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
