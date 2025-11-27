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
  private TIMELINE_STORAGE_KEY: string = 'tddTimelineData-global';
  private forceUpdateRequested: boolean = false;
  private currentProjectId: string = 'global';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.getTimeline = new GetTimeline(rootPath);
    this.getLastPoint = new GetLastPoint(context);

    // Inicializar con el proyecto actual
    this.updateProjectContext(rootPath);

    this.startTimelinePolling();
  }

  private updateProjectContext(rootPath: string): void {
    if (rootPath) {
      this.currentProjectId = this.generateProjectId(rootPath);
      this.TIMELINE_STORAGE_KEY = `tddTimelineData-${this.currentProjectId}`;
    } else {
      this.currentProjectId = 'global';
      this.TIMELINE_STORAGE_KEY = 'tddTimelineData-global';
    }

    // Cargar timeline guardado para este proyecto
    const savedTimeline = this.context.globalState.get(this.TIMELINE_STORAGE_KEY, []);
    if (savedTimeline && savedTimeline.length > 0) {
      this.lastTimelineData = savedTimeline;
      console.log(`[TimelineView] Timeline cargado para proyecto ${this.currentProjectId}: ${savedTimeline.length} elementos`);
    } else {
      console.log(`[TimelineView] No hay timeline guardado para proyecto ${this.currentProjectId}`);
    }
  }

  private generateProjectId(workspacePath: string): string {
    // Usar replaceAll en lugar de replace con regex
    return Buffer.from(workspacePath).toString('base64').replaceAll(/[^a-zA-Z0-9]/g, '').substring(0, 16);
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
      // Forzar actualización inmediata al mostrar el timeline
      const timeline = await this.getTimeline.execute();
      webview.html = this.generateHtml(timeline, webview);
      this.updateTimelineCache(timeline);
    } catch (err: any) {
      console.error('[TimelineView] Error al mostrar timeline:', err);
      // Mostrar datos guardados en caso de error
      webview.html = this.generateHtml(this.lastTimelineData, webview);
    }
  }

  public async getTimelineHtml(webview: vscode.Webview): Promise<string> {
    try {
      // Siempre obtener datos frescos para el HTML
      const timeline = await this.getTimeline.execute();
      console.log(`[TimelineView] Timeline items count para ${this.currentProjectId}:`, timeline.length);
      
      // Actualizar cache con los datos frescos
      this.updateTimelineCache(timeline);
      
      return this.generateHtmlFragment(timeline, webview);
    } catch (err: any) {
      console.error('[TimelineView] Error al generar HTML del timeline:', err);
      // Usar datos guardados en caso de error
      return this.generateHtmlFragment(this.lastTimelineData, webview);
    }
  }

  // Nuevo método: forzar actualización inmediata
  public async forceTimelineUpdate(): Promise<void> {
    try {
      console.log(`[TimelineView] Forzando actualización inmediata del timeline para proyecto ${this.currentProjectId}`);
      const currentTimeline = await this.getTimeline.execute();
      
      if (this.hasTimelineChanged(currentTimeline)) {
        this.updateTimelineCache(currentTimeline);
        
        // Notificar a todas las vistas webview
        if (this.currentWebview) {
          this.currentWebview.postMessage({
            command: 'updateTimeline',
            html: this.generateHtmlFragment(currentTimeline, this.currentWebview),
          });
        }
        
        // También notificar a través del event emitter
        TimelineView._onTimelineUpdated.fire(currentTimeline);
      }
    } catch (error) {
      console.error('[TimelineView] Error en actualización forzada:', error);
    }
  }

  private startTimelinePolling(): void {
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    setInterval(async () => {
      try {
        const currentTimeline = await this.getTimeline.execute();
        consecutiveErrors = 0;

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
      } catch (err: any) {
        consecutiveErrors++;
        console.error('[TimelineView] Error en polling del timeline:', err);
        if (consecutiveErrors === maxConsecutiveErrors) {
          console.warn('[TimelineView] Timeline no disponible tras múltiples intentos.');
        }
      }
    }, 2000); // Reducido a 2 segundos para mayor responsividad
  }

  private hasTimelineChanged(newTimeline: Array<Timeline | CommitPoint>): boolean {
    return JSON.stringify(newTimeline) !== JSON.stringify(this.lastTimelineData);
  }

  private updateTimelineCache(timeline: Array<Timeline | CommitPoint>): void {
    this.lastTimelineData = [...timeline];
    // Guardar inmediatamente en el estado global
    this.context.globalState.update(this.TIMELINE_STORAGE_KEY, timeline);
    TimelineView._onTimelineUpdated.fire(timeline);
    
    console.log(`[TimelineView] Timeline guardado para proyecto ${this.currentProjectId} con ${timeline.length} elementos`);
  }

  private generateHtmlFragment(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    if (!timeline || timeline.length === 0) {
      return '<p style="color:#666;font-size:12px;">Ejecuta tests para ver el timeline de TDD</p>';
    }

    const gitLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'images', 'git.png')
    );
    const regex = /refactor/i;

    const htmlContent = timeline
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

    return htmlContent || '<p style="color:#666;font-size:12px;">Sin datos de timeline</p>';
  }

  private generateHtml(
    timeline: Array<Timeline | CommitPoint>,
    webview: vscode.Webview
  ): string {
    const root = this.context.asAbsolutePath('');
const templatePath = path.join(
  root,
  'src',
  'presentation',
  'timeline',
  'templates'
);
    const htmlPath = path.join(templatePath, 'TimelineViewHTML.html');
    const cssPath = path.join(templatePath, 'TimelineViewCSS.css');

    console.log("HTML:", htmlPath, fs.existsSync(htmlPath));
console.log("CSS:", cssPath, fs.existsSync(cssPath));

    const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));

    let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    const timelineHtml = this.generateHtmlFragment(timeline, webview);

    htmlTemplate = htmlTemplate
      .replace('{{CSS_PATH}}', cssUri.toString())
      .replace('{{TIMELINE_CONTENT}}', timelineHtml);

    return htmlTemplate;
  }
}