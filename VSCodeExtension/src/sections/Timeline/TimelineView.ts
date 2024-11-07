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

    lastTestPoint(timeline: Array<Timeline | CommitPoint>): Timeline | undefined {
        for (let i = timeline.length - 1; i >= 0; i--) {
            if (timeline[i] instanceof Timeline && timeline[i] !== undefined) {
                return timeline[i] as Timeline;
            }
        }
        return undefined;
    }

    generateHtml(timeline: Array<Timeline | CommitPoint>, webview: vscode.Webview): string {
        const githubLogoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'images', 'github-color.png')
        );
    
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
                const date = point.commitTimestamp.toLocaleDateString();
                const time = point.commitTimestamp.toLocaleTimeString();
                return `
                    <div class="timeline-dot">
                        <img src="${githubLogoUri}" style="margin: 3px; width: 25px; height: 25px; border-radius: 50px;">
                        <span class="popup">
                            <strong>Commit ID:</strong> ${point.commitId}<br>
                            <strong>Fecha:</strong> ${date}<br>
                            <strong>Hora:</strong> ${time}
                        </span>
                    </div>
                `;
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
                <style>
                    .timeline-dot {
                        position: relative;
                        cursor: pointer;
                    }
                    .popup {
                        position: absolute;
                        top: 100%; /* Aparece debajo del punto */
                        left: 100%; /* Aparece a la derecha del punto */
                        margin-top: 8px; /* Espacio adicional debajo */
                        margin-left: 8px; /* Espacio adicional a la derecha */
                        display: none;
                        width: 150px;
                        padding: 8px;
                        background-color: #252526; /* Color oscuro similar al tema de VS Code */
                        color: #cccccc; /* Texto gris claro para mejor legibilidad */
                        text-align: left; /* Alineación para una mejor legibilidad */
                        font-size: 12px;
                        border-radius: 5px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* Sombra suave */
                        white-space: nowrap;
                        pointer-events: none;
                        border: 1px solid #3c3c3c; /* Borde sutil para darle el estilo de VS Code */
                        z-index: 9999; /* Asegura que el popup esté por encima de otros elementos */
                    }
                    .timeline-dot:hover .popup {
                        display: block;
                    }
                </style>
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
