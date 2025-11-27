import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GetTimeline } from '../../application/timeline/GetTimeline';
import { GetLastPoint } from '../../application/timeline/GetLastPoint';
import { Timeline } from '../../domain/timeline/Timeline';
import { CommitPoint } from '../../domain/timeline/CommitPoint';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class TimelineView implements vscode.WebviewViewProvider {
  private readonly context: vscode.ExtensionContext;
  public currentWebview: vscode.Webview | null = null;
  private readonly getTimeline: GetTimeline;
  private readonly getLastPoint: GetLastPoint;
  
  // Cache para la imagen en base64 para no leerla del disco cada vez
  private gitLogoBase64: string = '';

  static readonly _onTimelineUpdated: vscode.EventEmitter<
    Array<Timeline | CommitPoint>
  > = new vscode.EventEmitter<Array<Timeline | CommitPoint>>();
  public static readonly onTimelineUpdated: vscode.Event<
    Array<Timeline | CommitPoint>
  > = TimelineView._onTimelineUpdated.event;

  private lastTimelineData: Array<Timeline | CommitPoint> = [];
  private TIMELINE_STORAGE_KEY: string = 'tddTimelineData-global';
  private forceUpdateRequested: boolean = false;
  private currentProjectId: string = 'global';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.getTimeline = new GetTimeline(rootPath);
    this.getLastPoint = new GetLastPoint(context);

    // Cargar la imagen en memoria una sola vez al iniciar
    this.loadGitLogo();

    this.updateProjectContext(rootPath);
    this.startTimelinePolling();
  }

  // --- NUEVO MÉTODO: Cargar imagen como Base64 ---
  private loadGitLogo(): void {
    try {
      const imagePath = path.join(this.context.extensionUri.fsPath, 'images', 'git.png');
      const imageBuffer = fs.readFileSync(imagePath);
      // Convertir a string base64 listo para CSS
      this.gitLogoBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (e) {
      console.error('[TimelineView] Error cargando git.png:', e);
      // Fallback: un cuadrado gris si falla la lectura
      this.gitLogoBase64 = ''; 
    }
  }

  private updateProjectContext(rootPath: string): void {
    if (rootPath) {
      this.currentProjectId = this.generateProjectId(rootPath);
      this.TIMELINE_STORAGE_KEY = `tddTimelineData-${this.currentProjectId}`;
    } else {
      this.currentProjectId = 'global';
      this.TIMELINE_STORAGE_KEY = 'tddTimelineData-global';
    }

    const savedTimeline = this.context.globalState.get(this.TIMELINE_STORAGE_KEY, []);
    if (savedTimeline && savedTimeline.length > 0) {
      this.lastTimelineData = savedTimeline;
    }
  }

  private generateProjectId(workspacePath: string): string {
    return Buffer.from(workspacePath).toString('base64').replaceAll(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'src', 'presentation', 'timeline', 'templates'),
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
      webview.html = this.generateHtml(this.lastTimelineData, webview);
    }
  }

  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      const timeline = await this.getTimeline.execute();
      this.updateTimelineCache(timeline);
      return this.generateHtmlFragment(timeline, webview);
    } catch (err: any) {
      return this.generateHtmlFragment(this.lastTimelineData, webview);
    }
  }

  public async forceTimelineUpdate(): Promise<void> {
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
        TimelineView._onTimelineUpdated.fire(currentTimeline);
      }
    } catch (error) {
      console.error('[TimelineView] Error forceUpdate:', error);
    }
  }

  private startTimelinePolling(): void {
    // ... (Tu código de polling se mantiene igual) ...
    setInterval(async () => {
        try {
          const currentTimeline = await this.getTimeline.execute();
          if (this.hasTimelineChanged(currentTimeline) || this.forceUpdateRequested) {
            this.updateTimelineCache(currentTimeline);
            if (this.currentWebview) {
              this.currentWebview.postMessage({
                command: 'updateTimeline',
                html: this.generateHtmlFragment(currentTimeline, this.currentWebview),
              });
            }
            this.forceUpdateRequested = false;
          }
        } catch (err) { /* ignorar errores silenciosos */ }
    }, 2000);
  }

  private hasTimelineChanged(newTimeline: Array<Timeline | CommitPoint>): boolean {
    return JSON.stringify(newTimeline) !== JSON.stringify(this.lastTimelineData);
  }

  private updateTimelineCache(timeline: Array<Timeline | CommitPoint>): void {
    this.lastTimelineData = [...timeline];
    this.context.globalState.update(this.TIMELINE_STORAGE_KEY, timeline);
    TimelineView._onTimelineUpdated.fire(timeline);
  }

  private generateHtmlFragment(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    if (!timeline || timeline.length === 0) {
      return '<p style="color:#666;font-size:12px;">Ejecuta tests para ver el timeline de TDD</p>';
    }

    const regex = /refactor/i;

    const htmlContent = timeline
      .slice()
      .reverse()
      .map((point) => {
        if (point instanceof Timeline) {
          // ... Lógica de Timeline igual que antes ...
          const color = point.getColor();
          const passed = point.numPassedTests;
          const total = point.numTotalTests;
          const failed = total - passed;
          const symbol = '✓';
          const symbolColor = '#ffffff';
          const tooltip = `Tests: ${passed}/${total}`;

          return `
            <div class="timeline-dot" title="${tooltip}" 
                style="margin:3px;background:${color};width:24px;height:24px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:bold;color:${symbolColor};font-size:14px;">${symbol}
            </div>`;

        } else if (point instanceof CommitPoint) {
          const commitName = point.commitName || 'Commit sin mensaje';
          const tooltip = `Commit: ${commitName}`;
          
          // === SOLUCIÓN: Usar la imagen Base64 pre-cargada ===
          // Esto garantiza que la imagen se vea sí o sí.
          let htmlPoint = `
            <div class="timeline-dot" title="${tooltip}">
               <div style="
                margin: 3px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                background-color: #2d2d2d;
                background-image: url('${this.gitLogoBase64}');
                background-size: 65%;
                background-repeat: no-repeat;
                background-position: center;
               "></div>
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

    return htmlContent || '<p style="color:#666;">Sin datos</p>';
  }

  private generateHtml(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    const root = this.context.asAbsolutePath('');
    const templatePath = path.join(root, 'src', 'presentation', 'timeline', 'templates');
    const htmlPath = path.join(templatePath, 'TimelineViewHTML.html');
    const cssPath = path.join(templatePath, 'TimelineViewCSS.css');

    const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));
    const nonce = getNonce();

    let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    const timelineHtml = this.generateHtmlFragment(timeline, webview);

    htmlTemplate = htmlTemplate
      .replace('{{CSS_PATH}}', cssUri.toString())
      .replace('{{TIMELINE_CONTENT}}', timelineHtml)
      .replace(/{{CSP_SOURCE}}/g, webview.cspSource)
      .replace(/{{NONCE}}/g, nonce);

    return htmlTemplate;
  }
}