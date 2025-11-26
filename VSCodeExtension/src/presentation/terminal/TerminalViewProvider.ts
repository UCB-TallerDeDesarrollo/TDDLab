import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'node:fs/promises'; 
import { TimelineView } from '../timeline/TimelineView';
import { TerminalPort } from '../../domain/model/TerminalPort';

export class TerminalViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tddTerminalView';
  private readonly context: vscode.ExtensionContext;
  private webviewView?: vscode.WebviewView;
  private readonly timelineView: TimelineView;
  private readonly terminalPort: TerminalPort;
  
  // Estado persistente mejorado
  private terminalContent: string = '';
  private isWebviewReady: boolean = false;
  private pendingMessages: Array<{command: string, text?: string}> = [];

  private readonly CONTENT_STORAGE_KEY = 'tddTerminalContent';
  private readonly TEMPLATE_DIR: string;
  private helpTextCache: string | undefined;

  constructor(context: vscode.ExtensionContext, timelineView: TimelineView, terminalPort: TerminalPort) {
    this.context = context;
    this.timelineView = timelineView;
    this.terminalPort = terminalPort;

    this.TEMPLATE_DIR = path.join(this.context.extensionPath, 'src', 'presentation', 'terminal', 'templates');

    // Cargar contenido persistente al inicializar
    this.terminalContent = context.globalState.get(this.CONTENT_STORAGE_KEY, '');
    
    this.terminalPort.setOnOutputCallback((output: string) => {
      this.sendToTerminal(output);
      // Detectar cuando se completan tests y forzar actualización del timeline
      if (this.isTestOutput(output)) {
        this.forceTimelineUpdate();
      }
    });

    // Suscribirse a actualizaciones del timeline
    if (typeof (TimelineView as any).onTimelineUpdated === 'function') {
      (TimelineView as any).onTimelineUpdated(async () => {
        await this.updateTimelineInWebview();
      });
    }
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'src', 'presentation', 'terminal', 'templates')
      ]
    };

    let timelineHtml = '<p style="color: gray;">Timeline no disponible 🚨</p>';
    try {
      timelineHtml = await this.timelineView.getTimelineHtml(webviewView.webview);
    } catch (err) {
      console.error('[TerminalViewProvider] Error cargando timeline:', err);
    }

    webviewView.webview.html = await this.getHtml(webviewView.webview, timelineHtml);
    
    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.handleWebviewMessage(message);
    });

    // Inicializar estado
    this.isWebviewReady = false;
    
    console.log('[TerminalViewProvider] Webview inicializada ✅');
  }

  private async handleWebviewMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'executeCommand':
        await this.executeRealCommand(message.text);
        break;
      
      case 'requestTimelineUpdate':
        await this.updateTimelineInWebview();
        break;
      
      case 'killCommand':
        this.killCurrentCommand();
        break;
      
      case 'webviewReady':
        this.handleWebviewReady();
        break;
      
      case 'contentUpdate':
        this.terminalContent = message.content;
        this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);
        break;
      
      default:
        console.warn(`Comando no reconocido: ${message.command}`);
    }
  }

  private handleWebviewReady(): void {
    this.isWebviewReady = true;
    
    // Restaurar contenido persistente
    if (this.terminalContent && this.terminalContent.trim() !== '') {
      this.sendToWebview({
        command: 'restoreContent',
        content: this.terminalContent
      });
    } else {
      this.sendToTerminal('\r\nBienvenido a la Terminal TDD\r\n$ ');
    }

    // Procesar mensajes pendientes
    this.processPendingMessages();

    // Actualizar timeline inmediatamente
    setTimeout(async () => {
      await this.updateTimelineInWebview();
      // Forzar una actualización del timeline al cargar
      this.forceTimelineUpdate();
    }, 100);
  }

  private processPendingMessages(): void {
    if (this.isWebviewReady && this.pendingMessages.length > 0) {
      this.pendingMessages.forEach(message => {
        this.sendToWebview(message);
      });
      this.pendingMessages = [];
    }
  }

  private sendToWebview(message: any): void {
    if (this.webviewView && this.isWebviewReady) {
      this.webviewView.webview.postMessage(message);
    } else {
      this.pendingMessages.push(message);
    }
  }

  private async executeRealCommand(command: string): Promise<void> {
    if (!command.trim()) {
      this.sendToTerminal('$ ');
      return;
    }

    const trimmedCommand = command.trim();
    
    if (trimmedCommand === 'clear') {
      this.clearTerminal();
      return;
    }
    
    if (trimmedCommand === 'help' || trimmedCommand === '?') {
      await this.showHelp();
      return;
    }

    this.sendToTerminal(`\r\n$ ${trimmedCommand}\r\n`);

    try {
      await this.terminalPort.createAndExecuteCommand('TDDLab Terminal', trimmedCommand);
      
      // Forzar actualización del timeline después de comandos que puedan afectar tests
      if (this.isTestRelatedCommand(trimmedCommand)) {
        setTimeout(() => {
          this.forceTimelineUpdate();
        }, 1000);
      }
    } catch (error: any) {
      this.sendToTerminal(`❌ Error ejecutando comando: ${error.message}\r\n$ `);
    }
  }

  private isTestRelatedCommand(command: string): boolean {
    const testCommands = ['npm test', 'jest', 'mocha', 'test', 'npm run test'];
    return testCommands.some(testCmd => command.includes(testCmd));
  }

  private isTestOutput(output: string): boolean {
    const testIndicators = [
      'Tests:', 'passed', 'failed', '✓', '×', 'PASS', 'FAIL',
      'Test Suites:', 'test.js', 'spec.js'
    ];
    return testIndicators.some(indicator => output.includes(indicator));
  }

  private async forceTimelineUpdate(): Promise<void> {
    try {
      if (this.timelineView && typeof (this.timelineView as any).forceTimelineUpdate === 'function') {
        await (this.timelineView as any).forceTimelineUpdate();
      }
    } catch (error) {
      console.error('[TerminalViewProvider] Error forzando actualización del timeline:', error);
    }
  }

  private killCurrentCommand(): void {
    this.terminalPort.killCurrentProcess();
  }

  private async showHelp(): Promise<void> {
    if (!this.helpTextCache) {
      try {
        const helpPath = path.join(this.TEMPLATE_DIR, 'TerminalHelp.txt');
        this.helpTextCache = await fs.readFile(helpPath, 'utf-8');
      } catch (error) {
        console.error('Error cargando TerminalHelp.txt:', error);
        this.helpTextCache = '\r\n❌ Error al cargar la ayuda.\r\n$ ';
      }
    }
    this.sendToTerminal(this.helpTextCache);
  }

  private async updateTimelineInWebview() {
    if (this.webviewView) {
      try {
        const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
        this.sendToWebview({
          command: 'updateTimeline',
          html: newTimelineHtml
        });
      } catch (error) {
        console.error('[TerminalViewProvider] Error actualizando timeline:', error);
      }
    }
  }

  public sendToTerminal(message: string) {
    // Actualizar contenido persistente
    this.terminalContent += message;
    this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);
    
    this.sendToWebview({
      command: 'writeToTerminal',
      text: message
    });
  }

  public async executeCommand(command: string) {
    await this.executeRealCommand(command);
    
    // Forzar actualización del timeline para comandos de test
    if (this.isTestRelatedCommand(command)) {
      setTimeout(() => {
        this.forceTimelineUpdate();
      }, 1500);
    }
  }

  public clearTerminal() {
    this.terminalContent = '$ ';
    this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);
    
    this.sendToWebview({
      command: 'clearTerminal'
    });
  }

  private async getHtml(webview: vscode.Webview, timelineContent: string): Promise<string> {
    const htmlPath = path.join(this.TEMPLATE_DIR, 'TerminalViewHTML.html');
    const cssPath = path.join(this.TEMPLATE_DIR, 'TerminalViewCSS.css');

    let htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));

    htmlContent = htmlContent.replace('{{timelineContent}}', timelineContent);
    htmlContent = htmlContent.replace('{{cssUri}}', cssUri.toString());

    return htmlContent;
  }
}