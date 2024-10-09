// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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
        const jsonFilePath = path.join(this.context.extensionPath, 'src', 'data.json');

        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`Error al leer el archivo JSON: ${err.message}`);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                webview.html = getWebviewContent(jsonData);
            } catch (parseError) {
                vscode.window.showErrorMessage(`Error al parsear el archivo JSON`);
            }
        });
    }
}

function getWebviewContent(jsonData: { fecha: string; hora: string; resultado: string; prueba: string }[]): string {
    vscode.window.showInformationMessage('Vista web recargada correctamente.');
    const timelineHtml = jsonData.map(item => {
        const color = item.resultado === "fallida" ? "red" : "green";
        return `<div style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px";></div>`;
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
            <h2 style="margin-bottom: 1px">Línea de Tiempo</h2>
            <div style="display:flex; flex-wrap: wrap; margin-top: 0px">
                ${timelineHtml}
            </div>
        </body>
        </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
