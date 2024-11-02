import * as vscode from 'vscode';
import { Timeline } from '../domain/Timeline';
import { TimelineRepository } from '../repository/TimelineRepository';
import * as path from 'path';

export class TimelineViewProvider implements vscode.WebviewViewProvider {
    private context: vscode.ExtensionContext;
    public currentWebview: vscode.Webview | null = null;
    private timelineRepository: TimelineRepository;
    private statusBarItem: vscode.StatusBarItem;
    

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.timelineRepository = new TimelineRepository(rootPath);

        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);
        
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = { enableScripts: true };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }

    async showTimeline(webview: vscode.Webview): Promise<void> {
        try {
            const timelines = await this.timelineRepository.getTimelines();
            webview.html = this.generateHtml(timelines);
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
    }

    mostrarPunto(status_point: string) {
        let point = '🔴';
        let text = 'Último test fallido';
        if(status_point === 'green') {
            point = '🟢';
            text = 'Último test pasado';
        }
        this.statusBarItem.text = point;
        this.statusBarItem.tooltip = text;
        this.statusBarItem.show();
    }

    generateHtml(timelines: Timeline[]): string {
        const timelineHtml = timelines.map(item => {
            const color = item.getColor();
            return `<div style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px;"></div>`;
        }).join('');

        this.mostrarPunto(timelines[timelines.length - 1].getColor());

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Línea de Tiempo</title>
            </head>
            <body>
                <h2>Línea de Tiempo</h2>
                <div style="display: flex; flex-wrap: wrap;">
                    ${timelineHtml}
                </div>
            </body>
            </html>
        `;
    }
}
