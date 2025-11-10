import * as vscode from 'vscode';
import { GetTimeline } from '../../application/timeline/GetTimeline';
import { GetLastPoint } from '../../application/timeline/GetLastPoint';
import { Timeline } from '../../domain/timeline/Timeline';
import { CommitPoint } from '../../domain/timeline/CommitPoint';

export class TimelineView implements vscode.WebviewViewProvider {
  private readonly context: vscode.ExtensionContext;
  public currentWebview: vscode.Webview | null = null;
  private readonly getTimeline: GetTimeline;
  private readonly getLastPoint: GetLastPoint;

  static readonly _onTimelineUpdated: vscode.EventEmitter<
    Array<Timeline | CommitPoint>
  > = new vscode.EventEmitter<Array<Timeline | CommitPoint>>();
  public static readonly onTimelineUpdated: vscode.Event<
    Array<Timeline | CommitPoint>
  > = TimelineView._onTimelineUpdated.event;

  private lastTimelineData: Array<Timeline | CommitPoint> = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.getTimeline = new GetTimeline(rootPath);
    this.getLastPoint = new GetLastPoint(context);

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
      this.updateTimelineCache(timeline);
    } catch (err: any) {
      // Manejo explícito del error para cumplir Sonar
      console.error('[TimelineView] Error al mostrar timeline:', err);
      webview.html = `<h2>TDDLab Timeline</h2>
                      <p style="color:gray;">⚠️ Timeline no disponible</p>
                      <p style="color:#666;font-size:12px;">Ejecuta tests para ver el timeline</p>`;
    }
  }

  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      const timeline = await this.getTimeline.execute();
      console.log('[TimelineView] Timeline items count:', timeline.length);
      console.log('[TimelineView] Timeline data:', JSON.stringify(timeline));
      return this.generateHtmlFragment(timeline, webview);
    } catch (err: any) {
      // Manejo explícito del error
      console.error('[TimelineView] Error al generar HTML del timeline:', err);
      return `<p style="color:#666;font-size:12px;">Sin timeline disponible</p>`;
    }
  }

  private startTimelinePolling(): void {
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    setInterval(async () => {
      try {
        const currentTimeline = await this.getTimeline.execute();

        // Reiniciar contador de errores
        consecutiveErrors = 0;

        if (this.hasTimelineChanged(currentTimeline)) {
          this.updateTimelineCache(currentTimeline);

          if (this.currentWebview) {
            this.currentWebview.postMessage({
              command: 'updateTimeline',
              html: this.generateHtmlFragment(currentTimeline, this.currentWebview),
            });
          }
        }
      } catch (err: any) {
        consecutiveErrors++;
        // Registrar el error explícitamente
        console.error('[TimelineView] Error en polling del timeline:', err);

        if (consecutiveErrors === maxConsecutiveErrors) {
          console.warn('[TimelineView] Timeline no disponible en este proyecto tras múltiples intentos.');
        }
      }
    }, 4000);
  }

  private hasTimelineChanged(newTimeline: Array<Timeline | CommitPoint>): boolean {
    return JSON.stringify(newTimeline) !== JSON.stringify(this.lastTimelineData);
  }

  private updateTimelineCache(timeline: Array<Timeline | CommitPoint>): void {
    this.lastTimelineData = [...timeline];
    TimelineView._onTimelineUpdated.fire(timeline);
  }

  private generateHtmlFragment(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    const gitLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'images', 'git.png')
    );
    const regex = /refactor/i;

    return timeline
      .slice()
      .reverse()
      .map((point) => {
        if (point instanceof Timeline) {
          return this.generateTimelinePointHtml(point);
        } else if (point instanceof CommitPoint) {
          return this.generateCommitPointHtml(point, gitLogoUri, regex);
        }
        return '';
      })
      .join('');
  }

  private generateTimelinePointHtml(point: Timeline): string {
    const passed = point.numPassedTests;
    const total = point.numTotalTests;
    const failed = total - passed;
    const timestamp = new Date(point.timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const status = point.success ? '✅ Exitoso' : '❌ Fallido';
    const tooltip = `Tests: ${passed}/${total} pasados | ${failed} fallidos&#10;Estado: ${status}&#10;Fecha: ${timestamp}`;

    if (point.success) {
      // Test pasa - mostrar check verde
      return `<div class="timeline-item test-passed" title="${tooltip}">✓</div>`;
    } else {
      // Test falla - mostrar X roja
      return `<div class="timeline-item test-failed" title="${tooltip}">✗</div>`;
    }
  }

  private generateCommitPointHtml(
    point: CommitPoint, 
    gitLogoUri: vscode.Uri, 
    regex: RegExp
  ): string {
    const commitName = point.commitName || 'Commit sin mensaje';
    const tooltip = `Commit: ${commitName}`;
    
    let htmlPoint = `
      <div class="timeline-dot" title="${tooltip}">
        <img src="${gitLogoUri}" style="margin:3px;width:20px;height:20px;border-radius:50%;cursor:pointer;">
      </div>
    `;
    if (point.commitName && regex.test(point.commitName)) {
      htmlPoint += `<div class="timeline-dot" title="Refactor detectado" style="margin:3px;background:skyblue;width:20px;height:20px;border-radius:50%;cursor:pointer;"></div>`;
    }
    return htmlPoint;
  }

  private generateHtml(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    const timelineHtml = this.generateHtmlFragment(timeline, webview);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            background:#1e1e1e; 
            color:#eee; 
            font-family:monospace; 
            margin: 0;
            padding: 10px;
          }
          .timeline-dot { 
            display:inline-block; 
          }
          .timeline-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            margin: 3px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: transform 0.2s ease;
          }
          .timeline-item:hover {
            transform: scale(1.2);
          }
          .test-passed {
            color: #00ff00;
          }
          .test-failed {
            color: #ff0000;
          }
          #timeline-content { 
            display:flex;
            flex-direction:row;
            flex-wrap:wrap;
            align-items:center;
            gap: 2px;
          }
          h2 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 14px;
            color: #cccccc;
          }
        </style>
      </head>
      <body>
        <h2>TDDLab Timeline</h2>
        <div id="timeline-content">
          ${timelineHtml}
        </div>
        <script>
          window.addEventListener('message', event => {
            if (event.data.command === 'updateTimeline') {
              document.getElementById('timeline-content').innerHTML = event.data.html;
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
