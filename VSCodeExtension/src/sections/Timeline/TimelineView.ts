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

    // EventEmitter para notificar cambios en el timeline
    private static _onTimelineUpdated: vscode.EventEmitter<Array<Timeline | CommitPoint>> = new vscode.EventEmitter<Array<Timeline | CommitPoint>>();
    public static readonly onTimelineUpdated: vscode.Event<Array<Timeline | CommitPoint>> = TimelineView._onTimelineUpdated.event;
    
    // Cache del timeline para detectar cambios
    private lastTimelineData: Array<Timeline | CommitPoint> = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.getTimeline = new GetTimeline(rootPath);
        this.getLastPoint = new GetLastPoint(context);
        
        // Iniciar el polling para detectar cambios
        this.startTimelinePolling();
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
            
            // Actualizar cache y notificar si hay cambios
            this.updateTimelineCache(timeline);
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
    }

    public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
        try {
            const timeline = await this.getTimeline.execute();
            return this.generateHtmlFragment(timeline, webview);
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al cargar la línea de tiempo: ${err.message}`);
                console.error('[TimelineView] getTimelineHtml error:', err);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al cargar la línea de tiempo.`);
                console.error('[TimelineView] getTimelineHtml unknown error:', err);
            }

            return `<p style="color: red;">Error al cargar la línea de tiempo</p>`;
        }
    }
    private startTimelinePolling(): void {
        setInterval(async () => {
            try {
                const currentTimeline = await this.getTimeline.execute();
                
                // Verificar si hay cambios comparando con el cache
                if (this.hasTimelineChanged(currentTimeline)) {
                    this.updateTimelineCache(currentTimeline);
                    
                    // Actualizar el webview principal si existe
                    if (this.currentWebview) {
                        this.currentWebview.html = this.generateHtml(currentTimeline, this.currentWebview);
                    }
                }
            } catch (err) {
                console.error('[TimelineView] Error en polling:', err);
            }
        }, 2000); // Verificar cada 2 segundos
    }
    // Método para verificar si el timeline ha cambiado
    private hasTimelineChanged(newTimeline: Array<Timeline | CommitPoint>): boolean {
        if (newTimeline.length !== this.lastTimelineData.length) {
            return true;
        }

        // Comparación simple por longitud y últimos elementos
        for (let i = 0; i < newTimeline.length; i++) {
            const newItem = newTimeline[i];
            const oldItem = this.lastTimelineData[i];
            
            if (newItem instanceof Timeline && oldItem instanceof Timeline) {
                if (newItem.numPassedTests !== oldItem.numPassedTests || 
                    newItem.numTotalTests !== oldItem.numTotalTests ||
                    newItem.timestamp.getTime() !== oldItem.timestamp.getTime()) {
                    return true;
                }
            } else if (newItem instanceof CommitPoint && oldItem instanceof CommitPoint) {
                if (newItem.commitName !== oldItem.commitName ||
                    newItem.commitTimestamp.getTime() !== oldItem.commitTimestamp.getTime()) {
                    return true;
                }
            } else if (newItem.constructor !== oldItem.constructor) {
                return true;
            }
        }
        
        return false;
    }

    // Método para actualizar el cache y notificar cambios
    private updateTimelineCache(timeline: Array<Timeline | CommitPoint>): void {
        this.lastTimelineData = [...timeline]; // Crear copia del array
        
        // Emitir evento de actualización
        TimelineView._onTimelineUpdated.fire(timeline);
    }

    lastTestPoint(timeline: Array<Timeline | CommitPoint>): Timeline | undefined {
        for (let i = timeline.length - 1; i >= 0; i--) {
            if (timeline[i] instanceof Timeline && timeline[i] !== undefined) {
                return timeline[i] as Timeline;
            }
        }
        return undefined;
    }

    private generateHtmlFragment(timeline: Array<Timeline | CommitPoint>, webview: vscode.Webview): string {
        const gitLogoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'images', 'git.png')
        );
        const regex = /refactor/i;

        return timeline.slice().reverse().map(point => {
            if (point instanceof Timeline) {
                const color = point.getColor();
                const date = point.timestamp.toLocaleDateString('es-Es',{
                    day:'2-digit',
                    month:'2-digit',
                    year:'numeric'
                });

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
                  const date = point.commitTimestamp.toLocaleDateString('es-Es',{
                    day:'2-digit',
                    month:'2-digit',
                    year:'numeric'});

                const time = point.commitTimestamp.toLocaleTimeString();

                htmlPoint += `
                    <div class="timeline-dot">
                        <img src="${gitLogoUri}" style="margin: 3px; width: 25px; height: 25px; border-radius: 50px;">
                        <span class="popup">
                            <strong>Nombre:</strong> ${point.commitName ?? ''}<br>
                            <strong>Fecha:</strong> ${date} ${time}
                        </span>
                    </div>
                `;

                
                if (point.commitName && regex.test(point.commitName)) {
                    htmlPoint += `
                        <div class="timeline-dot" style="margin: 3px; background-color: skyblue; width: 25px; height: 25px; border-radius: 50px;">
                            <span class="popup">
                                <center><strong>Punto de Refactoring</strong></center>
                            </span>
                        </div>
                    `;
                }
              
                return htmlPoint;
            }
            return '';
        }).join('');
    }

    generateHtml(timeline: Array<Timeline | CommitPoint>, webview: vscode.Webview): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'style.css')
        );

        const timelineHtml = this.generateHtmlFragment(timeline, webview);

        const lastPoint = this.lastTestPoint(timeline);
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