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

    lastTestPoint(timeline: Array<Timeline | CommitPoint >): Timeline | undefined {
        for (let i = timeline.length - 1; i >= 0; i--) {
            if (timeline[i] instanceof Timeline && timeline[i] !== undefined) {
                return timeline[i] as Timeline;
            }
        }
        return undefined;
    }

    generateHtml(timeline: Array<Timeline | CommitPoint >, webview: vscode.Webview): string {
        const gitLogoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'images', 'git.png')
        );
        const githubLogoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'images', 'github-color.png')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'style.css')
        );
        const regex = /refactor/i;
    
        const timelineHtml = timeline.map(point => {
            if (point instanceof Timeline) {
                const color = point.getColor();
                const date = point.timestamp.toLocaleDateString();
                const time = point.timestamp.toLocaleTimeString();
                
                return `
                    <div class="timeline-dot" style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px;">
                        <span class="popup">
                            <strong>Pruebas:</strong> ${point.numPassedTests}/${point.numTotalTests}<br>
                            <strong>Fecha:</strong> ${date}<br>
                            <strong>Hora:</strong> ${time}
                        </span>
                    </div>
                `;
            } else if (point instanceof CommitPoint) {
                let htmlPoint = '';
                if (point.commitName && regex.test(point.commitName)) {
                    htmlPoint += `
                    <div class="timeline-dot" style="margin: 3px; background-color: skyblue; width: 25px; height: 25px; border-radius: 50px;">
                        <span class="popup">
                            <center><strong>Punto de Refactoring</strong></center>
                        </span>
                    </div>
                `; }
                const date = point.commitTimestamp.toLocaleDateString();
                const time = point.commitTimestamp.toLocaleTimeString();
                htmlPoint += `
                    <div class="timeline-dot">
                        <img src="${gitLogoUri}" style="margin: 3px; width: 25px; height: 25px; border-radius: 50px;">
                        <span class="popup">
                            <strong>Nombre:</strong> ${point.commitName ? point.commitName : ''}<br>
                            <strong>Commit ID:</strong> ${point.commitId}<br>
                            <strong>Fecha:</strong> ${date} ${time}
                        </span>
                    </div>
                `;
                return htmlPoint;
            }      
        }).join('');
    
        let lastPoint = this.lastTestPoint(timeline);
        if (lastPoint !== undefined) {
            this.getLastPoint.execute(lastPoint.getColor());
        }
    
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Línea de Tiempo</title>
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <h2>TDDLab Timeline</h2>
                <div style="display: flex; flex-wrap: wrap;">
                    ${timelineHtml}
                </div>
            </body>
            </html>
        `;
    }
    
    
}
