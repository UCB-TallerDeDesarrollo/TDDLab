import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GetTimeline } from '../../application/timeline/GetTimeline';
import { GetLastPoint } from '../../application/timeline/GetLastPoint';
import { Timeline } from '../../domain/timeline/Timeline';
import { CommitPoint } from '../../domain/timeline/CommitPoint';

export class TimelineView implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTimelineView';
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
  // CAMBIO 1: Key para guardar datos
  private readonly STORAGE_KEY = 'tddTimelineData';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.getTimeline = new GetTimeline(rootPath);
    this.getLastPoint = new GetLastPoint(context);
    
    // CAMBIO 2: Recuperar historial al iniciar
    const savedData = this.context.workspaceState.get(this.STORAGE_KEY, []);
    this.lastTimelineData = savedData as any[];

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

    // CAMBIO 3: Evitar reseteo de pestaña al cambiar focus
    (webviewView as any).webview.options = {
        ...webviewView.webview.options,
        retainContextWhenHidden: true
    };

    this.currentWebview = webviewView.webview;

    TimelineView.onTimelineUpdated(async (timeline) => {
      const webview = webviewView.webview;
      webview.postMessage({
        command: 'updateTimeline',
        html: this.generateHtmlFragment(timeline, webview)
      });
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.showTimeline(webviewView.webview);
      }
    });

    this.showTimeline(webviewView.webview);
  }

 async showTimeline(webview: vscode.Webview): Promise<void> {
  try {
    // Intentamos cargar lo que ya tenemos en memoria primero (rapidez)
    let timelineHtml = this.generateHtmlFragment(this.lastTimelineData, webview);
    
    // Si podemos obtener fresco, mejor
    try {
        const freshHtml = await this.getTimelineHtml(webview);
        timelineHtml = freshHtml;
    } catch {}

    webview.html = `
      <h2 style="margin:0 0 10px 0;color:#ccc;font-size:14px;">TDDLab Timeline</h2>

      <style>
        body {
          background: #1e1e1e;
          color: #eee;
          font-family: monospace;
          margin: 0;
          padding: 10px;
        }

        /* -------- TIMELINE HORIZONTAL REAL -------- */
        #timeline-content {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          gap: 6px !important;
          align-items: center !important;
          width: 100%;
          padding-bottom: 10px;
        }

        .timeline-dot {
          width: 26px;
          height: 26px;
          min-width: 26px;
          min-height: 26px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          color: #fff;
          cursor: pointer;
          flex-shrink: 0;
          background: #555;
        }
      </style>

      <div id="timeline-content">${timelineHtml}</div>

      <script>
        const vscode = acquireVsCodeApi();
        window.addEventListener('message', event => {
          if (event.data.command === 'updateTimeline') {
            document.getElementById('timeline-content').innerHTML = event.data.html;
          }
        });
      </script>
    `;
  } catch {
    // Fallback html
    webview.html = `... (tu html de error original) ...`;
  }
}


  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      const timeline = await this.getTimeline.execute();
      this.updateTimelineCache(timeline); // Guardamos cuando obtenemos éxito
      return this.generateHtmlFragment(timeline, webview);
    } catch {
      // Si falla, devolvemos lo que tenemos guardado
      return this.generateHtmlFragment(this.lastTimelineData, webview);
    }
  }

  private startTimelinePolling(): void {
    setInterval(async () => {
      try {
        const currentTimeline = await this.getTimeline.execute();
        
        if (this.hasTimelineChanged(currentTimeline)) {
          this.updateTimelineCache(currentTimeline);
          if (this.currentWebview) {
            this.currentWebview.postMessage({
              command: 'updateTimeline',
              html: this.generateHtmlFragment(currentTimeline, this.currentWebview),
            });
          }
        }
      } catch {}
    }, 4000);
  }

  private hasTimelineChanged(newTimeline: Array<Timeline | CommitPoint>): boolean {
    return JSON.stringify(newTimeline) !== JSON.stringify(this.lastTimelineData);
  }

  private updateTimelineCache(timeline: Array<Timeline | CommitPoint>): void {
    this.lastTimelineData = [...timeline];
    // CAMBIO 4: Persistir en disco
    this.context.workspaceState.update(this.STORAGE_KEY, timeline);
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

    if (!timeline || timeline.length === 0) return '';

    return timeline
      .slice()
      .reverse()
      .map((point: any) => { // Cast a any para tolerar datos recuperados del storage
        // Chequeo más flexible para soportar objetos recuperados del JSON
        const isTimeline = point.numTotalTests !== undefined; 
        const isCommit = point.commitName !== undefined;

        if (isTimeline) {
          // Lógica original, recuperando color si existe el método o calculándolo
          let color;
          if (point.getColor) color = point.getColor();
          else color = point.success ? '#4caf50' : '#f44336'; // Fallback simple

          const passed = point.numPassedTests;
          const total = point.numTotalTests;
          const failed = total - passed;
          const status = point.success ? 'Exitoso' : 'Fallido';
          // timestamp puede venir como string del JSON storage
          const timeStr = point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : ''; 
          const tooltip = `Tests: ${passed}/${total} | ${failed} fallidos | ${status} | ${timeStr}`;

          return `
            <div class="timeline-dot" title="${tooltip}" 
                style="margin:3px;background:${color};width:24px;height:24px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:14px;">✓</div>`;
        } else if (isCommit) {
          const commitName = point.commitName || 'Commit sin mensaje';
          const tooltip = `Commit: ${commitName}`;
          let htmlPoint = `
            <div class="timeline-dot" title="${tooltip}">
              <img src="${gitLogoUri}" style="margin:3px;width:24px;height:24px;border-radius:50%;cursor:pointer;">
            </div>
          `;
          if (regex.test(commitName)) {
            htmlPoint += `<div class="timeline-dot" style="margin:3px;background:skyblue;width:24px;height:24px;border-radius:50%;cursor:pointer;"></div>`;
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