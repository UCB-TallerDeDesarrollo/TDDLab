import * as vscode from 'vscode';
import { GetTimeline } from '../../modules/Timeline/application/GetTimeline';
import { GetLastPoint } from '../../modules/Timeline/application/GetLastPoint';
import { Timeline } from '../../modules/Timeline/domain/Timeline';
import { CommitPoint } from '../../modules/Timeline/domain/CommitPoint';

export class TimelineView implements vscode.WebviewViewProvider {
    private readonly context: vscode.ExtensionContext;
    public currentWebview: vscode.Webview | null = null;
    private readonly getTimeline: GetTimeline;
    private readonly getLastPoint: GetLastPoint;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.getTimeline = new GetTimeline(rootPath);
        this.getLastPoint = new GetLastPoint(context);
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = { enableScripts: true };
        this.currentWebview = webviewView.webview;
        this.showTimeline(this.currentWebview);
    }

    async showTimeline(webview: vscode.Webview): Promise<void> {
        try {
            const timeline = await this.getTimeline.execute();
            webview.html = this.generateHtml(timeline, webview);
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
    }

    lastTestPoint(timeline: Array<Timeline | CommitPoint>): Timeline {
        if (timeline[0] instanceof Timeline && timeline[0] !== undefined) {
            return timeline[0];
        }
        const f: Timeline = new Timeline(12, 12, new Date(3817298738917));
        return f;
    }

    generateHtml(timeline: Array<Timeline | CommitPoint>, webview: vscode.Webview): string {
        const githubLogoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'images', 'github-color.png')
        );
        const timelineHtml = timeline.map(point => {
            if (point instanceof Timeline) {
                const color = point.getColor();
                return `<div style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px;"></div>`;
            }
            else if (point instanceof CommitPoint) {
                return `<img src="${githubLogoUri}" style="margin: 3px; width: 25px; height: 25px; border-radius: 50px;">`;
            }
        }).join('');

        this.getLastPoint.execute(this.lastTestPoint(timeline).getColor());

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
