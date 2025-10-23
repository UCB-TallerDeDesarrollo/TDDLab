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

  private static _onTimelineUpdated: vscode.EventEmitter<
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
    } catch (err) {
      webview.html = `<h2>TDDLab Timeline</h2>
                      <p style="color:gray;">⚠️ Timeline no disponible</p>
                      <p style="color:#666;font-size:12px;">Ejecuta tests para ver el timeline</p>`;
      console.debug('[TimelineView] Timeline no disponible (esperado en proyectos sin tests)');
    }
  }

  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      const timeline = await this.getTimeline.execute();
      return this.generateHtmlFragment(timeline, webview);
    } catch (err) {
      console.debug('[TimelineView] Timeline no disponible');
      return `<p style="color:#666;font-size:12px;">Sin timeline disponible</p>`;
    }
  }

  private startTimelinePolling(): void {
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    setInterval(async () => {
      try {
        const currentTimeline = await this.getTimeline.execute();
        
       
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
      } catch (err) {
        consecutiveErrors++;
        
       
        if (consecutiveErrors === maxConsecutiveErrors) {
          console.debug('[TimelineView] Timeline no disponible en este proyecto');
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
      .map((point, index) => {
        if (point instanceof Timeline) {
          const color = point.getColor();
          const passed = point.numPassedTests;
          const total = point.numTotalTests;
          const failed = total - passed; // Calcular tests fallidos
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
          
          return `<div class="timeline-dot" title="${tooltip}" style="margin:3px;background:${color};width:20px;height:20px;border-radius:50%;cursor:pointer;"></div>`;
        } else if (point instanceof CommitPoint) {
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
        return '';
      })
      .join('');
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
          body { background:#1e1e1e; color:#eee; font-family:monospace; }
          .timeline-dot { display:inline-block; }
          #timeline-content { 
            display:flex;
            flex-direction:row;
            flex-wrap:wrap;
            align-items:center;
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