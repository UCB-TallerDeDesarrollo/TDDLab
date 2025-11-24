import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(
          this.context.extensionUri,
          'src',
          'presentation',
          'timeline',
          'templates'
        ),
        vscode.Uri.joinPath(this.context.extensionUri, 'images')
      ]
    };

    this.currentWebview = webviewView.webview;
    this.showTimeline(this.currentWebview);
  }

  async showTimeline(webview: vscode.Webview): Promise<void> {
    try {
      const timeline = await this.getTimeline.execute();
      webview.html = this.generateHtml(timeline, webview);
      this.updateTimelineCache(timeline);
    } catch (err: any) {
      console.error('[TimelineView] Error al mostrar timeline:', err);
      webview.html = `
        <h2>TDDLab Timeline</h2>
        <p style="color:gray;">⚠️ Timeline no disponible</p>
        <p style="color:#666;font-size:12px;">Ejecuta tests para ver el timeline</p>
      `;
    }
  }

  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      const timeline = await this.getTimeline.execute();
      console.log('[TimelineView] Timeline items count:', timeline.length);
      return this.generateHtmlFragment(timeline, webview);
    } catch (err: any) {
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
        console.error('[TimelineView] Error en polling del timeline:', err);
        if (consecutiveErrors === maxConsecutiveErrors) {
          console.warn('[TimelineView] Timeline no disponible tras múltiples intentos.');
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
          const color = point.getColor();
          const passed = point.numPassedTests;
          const total = point.numTotalTests;
          const failed = total - passed;
          const timestamp = new Date(point.timestamp).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          });
          const status = point.success ? '✅ Exitoso' : '❌ Fallido';
          const tooltip = `Tests: ${passed}/${total} pasados | ${failed} fallidos&#10;Estado: ${status}&#10;Fecha: ${timestamp}`;
          
          const symbol = '✓';
          const symbolColor = '#ffffff';

          return `
            <div class="timeline-dot" title="${tooltip}" 
                style="margin:3px;background:${color};width:24px;height:24px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:bold;color:${symbolColor};font-size:14px;">${symbol}
            </div>`;

        } else if (point instanceof CommitPoint) {
          const commitName = point.commitName || 'Commit sin mensaje';
          const tooltip = `Commit: ${commitName}`;
          let htmlPoint = `
            <div class="timeline-dot" title="${tooltip}">
              <img src="${gitLogoUri}" style="margin:3px;width:24px;height:24px;border-radius:50%;cursor:pointer;">
            </div>
          `;
          if (point.commitName && regex.test(point.commitName)) {
            htmlPoint += `<div class="timeline-dot" title="Refactor detectado" style="margin:3px;background:skyblue;width:24px;height:24px;border-radius:50%;cursor:pointer;"></div>`;
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
    const templatePath = path.join(
      this.context.extensionUri.fsPath, 'src', 'presentation', 'timeline', 'templates'
    );
    const htmlPath = path.join(templatePath, 'TimelineViewHTML.html');
    const cssPath = path.join(templatePath, 'TimelineViewCSS.css');

    const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));

    let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    const timelineHtml = this.generateHtmlFragment(timeline, webview);

    htmlTemplate = htmlTemplate
      .replace('{{CSS_PATH}}', cssUri.toString())
      .replace('{{TIMELINE_CONTENT}}', timelineHtml);

    return htmlTemplate;
  }
}
