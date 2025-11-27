// src/presentation/terminal/TerminalViewProvider.ts
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
  
  private terminalContent: string = '';
  private isWebviewReady: boolean = false;
  private pendingMessages: Array<{command: string, text?: string}> = [];

  private CONTENT_STORAGE_KEY: string = 'tddTerminalContent-global';
  private readonly TEMPLATE_DIR: string;
  private helpTextCache: string | undefined;
  private currentProjectId: string = 'global';
  private scrollTimeout: NodeJS.Timeout | null = null;
  private isUpdatingTimeline: boolean = false;

  constructor(context: vscode.ExtensionContext, timelineView: TimelineView, terminalPort: TerminalPort) {
    this.context = context;
    this.timelineView = timelineView;
    this.terminalPort = terminalPort;

    this.TEMPLATE_DIR = path.join(this.context.extensionPath, 'src', 'presentation', 'terminal', 'templates');

    this.updateProjectContext();
    
    this.terminalPort.setOnOutputCallback((output: string) => {
      this.sendToTerminal(output);
      if (this.isTestOutput(output)) {
        this.forceTimelineUpdate();
      }
    });

    this.setupWorkspaceListeners();

    if (typeof (TimelineView as any).onTimelineUpdated === 'function') {
      (TimelineView as any).onTimelineUpdated(async () => {
        await this.updateTimelineInWebview();
      });
    }
  }

  private updateProjectContext(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspacePath = workspaceFolders[0].uri.fsPath;
      this.currentProjectId = this.generateProjectId(workspacePath);
      this.CONTENT_STORAGE_KEY = `tddTerminalContent-${this.currentProjectId}`;
      
      this.terminalContent = this.context.globalState.get(this.CONTENT_STORAGE_KEY, '');
      
      console.log(`[TerminalViewProvider] Contexto actualizado para proyecto: ${this.currentProjectId}`);
    } else {
      this.currentProjectId = 'global';
      this.CONTENT_STORAGE_KEY = 'tddTerminalContent-global';
      this.terminalContent = this.context.globalState.get(this.CONTENT_STORAGE_KEY, '');
      
      console.log('[TerminalViewProvider] Usando sesión global (sin workspace)');
    }
  }

  private generateProjectId(workspacePath: string): string {
    return Buffer.from(workspacePath).toString('base64').replaceAll(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private setupWorkspaceListeners(): void {
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      console.log('[TerminalViewProvider] Workspace cambiado, actualizando contexto...');
      await this.handleWorkspaceChange();
    });

    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (editor) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (workspaceFolder) {
          const newProjectId = this.generateProjectId(workspaceFolder.uri.fsPath);
          if (newProjectId !== this.currentProjectId) {
            console.log('[TerminalViewProvider] Proyecto activo cambiado, actualizando contexto...');
            await this.handleWorkspaceChange();
          }
        }
      }
    });
  }

  private async handleWorkspaceChange(): Promise<void> {
    this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);

    this.updateProjectContext();

    if (this.webviewView) {
      this.sendToWebview({
        command: 'clearTerminal'
      });
    }

    if (this.terminalContent && this.terminalContent.trim() !== '') {
      this.sendToWebview({
        command: 'restoreContent',
        content: this.terminalContent
      });
    } else {
      const currentDir = process.cwd();
      this.sendToTerminal(`\r\nBienvenido a la Terminal TDD - Proyecto: ${this.getProjectName()}\r\n${currentDir}> `);
    }

    await this.forceTimelineUpdate();
    await this.updateTimelineInWebview();
  }

  private getProjectName(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].name;
    }
    return 'Global';
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

    this.isWebviewReady = false;
    
    console.log(`[TerminalViewProvider] Webview inicializada para proyecto: ${this.currentProjectId}`);
  }

  private sendPrompt(): void {
    this.terminalPort.createAndExecuteCommand('TDDLab Terminal', '');
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

      case 'getProjectContext':
        this.sendToWebview({
          command: 'projectContext',
          projectName: this.getProjectName(),
          projectId: this.currentProjectId
        });
        break;
      
      default:
        console.warn(`Comando no reconocido: ${message.command}`);
    }
  }

  private handleWebviewReady(): void {
    this.isWebviewReady = true;
    
    this.sendToWebview({
      command: 'projectContext',
      projectName: this.getProjectName(),
      projectId: this.currentProjectId
    });

    if (this.terminalContent && this.terminalContent.trim() !== '') {
      this.sendToWebview({
        command: 'restoreContent',
        content: this.terminalContent
      });
    } else {
      const currentDir = process.cwd();
      this.sendToTerminal(`\r\nBienvenido a la Terminal TDD - Proyecto: ${this.getProjectName()}\r\n${currentDir}> `);
    }

    this.processPendingMessages();

    setTimeout(async () => {
      await this.updateTimelineInWebview();
      await this.forceTimelineUpdate();
    }, 100);
  }

  private processPendingMessages(): void {
    if (this.isWebviewReady && this.pendingMessages.length > 0) {
      for (const message of this.pendingMessages) {
        this.sendToWebview(message);
      }
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

  private scrollToBottom(): void {
    if (this.isUpdatingTimeline) {
      return;
    }
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      this.sendToWebview({
        command: 'scrollToBottom'
      });
      this.scrollTimeout = null;
    }, 300);
  }

  private async executeRealCommand(command: string): Promise<void> {
    if (!command.trim()) {
      const currentDir = process.cwd();
      this.sendToTerminal(`${currentDir}> ${command}\n`);
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

    if (trimmedCommand === 'project') {
      this.sendToTerminal(`\r\nProyecto actual: ${this.getProjectName()} (ID: ${this.currentProjectId})\r\n`);
      const currentDir = process.cwd();
      this.sendToTerminal(`${currentDir}> `);
      return;
    }

    this.sendToTerminal(`\r\n$ ${trimmedCommand}\r\n`);

    try {
      await this.terminalPort.createAndExecuteCommand('TDDLab Terminal', trimmedCommand);
      
      if (this.isTestRelatedCommand(trimmedCommand)) {
        setTimeout(() => {
          this.forceTimelineUpdate();
        }, 1000);
      }
    } catch (error: any) {
      this.sendToTerminal(`❌ Error ejecutando comando: ${error.message}\r\n`);
      this.sendPrompt();
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
        const helpContent = await fs.readFile(helpPath, 'utf-8');
        this.helpTextCache = helpContent + '\r\n$ ';
      } catch (error) {
        console.error('Error cargando TerminalHelp.txt:', error);
        this.helpTextCache = '\r\n❌ Error al cargar la ayuda.\r\n';
      }
    }

    this.sendToTerminal(this.helpTextCache);
    this.sendPrompt();
  }

  private async updateTimelineInWebview() {
    if (this.webviewView) {
      try {
        this.isUpdatingTimeline = true;
        
        const newTimelineHtml = await this.timelineView.getTimelineHtml(this.webviewView.webview);
        this.sendToWebview({
          command: 'updateTimeline',
          html: newTimelineHtml
        });
        
        setTimeout(() => {
          this.isUpdatingTimeline = false;
        }, 500);
      } catch (error) {
        console.error('[TerminalViewProvider] Error actualizando timeline:', error);
        this.isUpdatingTimeline = false;
      }
    }
  }

  public sendToTerminal(message: string, isRestoring: boolean = false, skipColorize: boolean = false) {
    let coloredMessage = skipColorize ? message : this.colorizeTestOutput(message);
    
    if (!isRestoring) {
      this.terminalContent += coloredMessage;
      this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);
    }
    
    this.sendToWebview({
      command: 'writeToTerminal',
      text: coloredMessage
    });
    
    if (!this.isUpdatingTimeline) {
      this.scrollToBottom();
    }
  }

  private colorizeTestOutput(text: string): string {
    const RED = '\x1b[31m';
    const GREEN = '\x1b[32m';
    const YELLOW = '\x1b[33m';
    const BRIGHT_RED = '\x1b[91m';
    const BRIGHT_GREEN = '\x1b[92m';
    const RESET = '\x1b[0m';
    
    let result = text;
    
    result = result.replaceAll(/(Test Suites:)\s+(\d+)\s+(failed)/gi, 
      `$1 ${BRIGHT_RED}$2 $3${RESET}`);
    
    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(failed),\s+(\d+)\s+(passed)/gi, 
      `$1 ${BRIGHT_RED}$2 $3${RESET}, ${BRIGHT_GREEN}$4 $5${RESET}`);
    
    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(passed)/gi, 
      `$1 ${BRIGHT_GREEN}$2 $3${RESET}`);
    
    result = result.replaceAll(/(Tests:)\s+(\d+)\s+(failed)/gi, 
      `$1 ${BRIGHT_RED}$2 $3${RESET}`);
    
    result = result.replaceAll(/(PASS\s+[^\n]+)/g, `${GREEN}$1${RESET}`);
    
    result = result.replaceAll(/(FAIL\s+[^\n]+)/g, `${RED}$1${RESET}`);
    
    result = result.replaceAll(/(✓|✔)/g, `${GREEN}$1${RESET}`);
    
    result = result.replaceAll(/(✗|✘)/g, `${RED}$1${RESET}`);
    
    result = result.replaceAll(/(Expected|Received):/gi, `${RED}$1:${RESET}`);
    
    result = result.replaceAll(/(Error:|Error at)/gi, `${RED}$1${RESET}`);
    
    result = result.replaceAll(/(Snapshots:)\s+(\d+)\s+(total)/gi, 
      `$1 ${YELLOW}$2 $3${RESET}`);
    
    result = result.replaceAll(/(Time:)\s+([0-9.]+\s*s)/gi, 
      `$1 ${YELLOW}$2${RESET}`);
    
    return result;
  }

  public async executeCommand(command: string) {
    await this.executeRealCommand(command);
    
    if (this.isTestRelatedCommand(command)) {
      setTimeout(() => {
        this.forceTimelineUpdate();
      }, 1500);
    }
  }

  public clearTerminal() {
    this.terminalContent = '';
    this.context.globalState.update(this.CONTENT_STORAGE_KEY, this.terminalContent);
    
    if (this.webviewView) {
      this.sendToWebview({
        command: 'clearTerminal'
      });
      setTimeout(() => {
        const currentDir = process.cwd();   
        this.sendToTerminal(`${currentDir}> `);
      }, 100);
    }
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