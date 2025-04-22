import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

export class AIWebviewPanel {
  private readonly panel: vscode.WebviewPanel;
  private readonly messages: string[] = [];

  constructor() {
    this.panel = vscode.window.createWebviewPanel(
      'aiPanel',
      'Asistente de IA',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );
    this.update();
  }

  public reveal() {
    this.panel.reveal(vscode.ViewColumn.Beside);
  }

  public onDispose(callback: () => void) {
    this.panel.onDidDispose(callback);
  }


  private createMessagesHtml(): string {
    return this.messages.map(msg => `<p>${msg}</p>`).join('');
  }

  private generateHtmlContent(messagesHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; padding: 1rem; }
          h1 { color: #007acc; }
        </style>
      </head>
      <body>
        <h1>Asistente de IA</h1>
        ${messagesHtml}
      </body>
      </html>
    `;
  }

  public update() {
    const messagesHtml = this.createMessagesHtml();
    this.panel.webview.html = this.generateHtmlContent(messagesHtml);
  }

  private handleError(err: any): void {
    console.error(err);
    this.messages.push('Error leyendo archivos o llamando a la API');
    this.update();
  }

  private async handleApiResponse(response: string): Promise<void> {
    console.log("RESPUESTAAAA", response);
    this.messages.push(response);
    this.update();
  }

  private readTddLogFile(tddLogPath: string): string {
    return fs.readFileSync(tddLogPath, 'utf-8');
  }

  private parseJson(content: string): any {
    return JSON.parse(content);
  }

  private createApiRequestBody(tddLogJson: any, gitInfo: any): string {
    return JSON.stringify({
      tddlog: tddLogJson,
      gitInfo: gitInfo
    });
  }

  private getTDDFeedback(data: string): Promise<string> {
    const horaActual = new Date().toLocaleTimeString();
    return Promise.resolve(`Hora actual del sistema: ${horaActual}`);
  }

  public async fetchResponse() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const tddLogPath = path.join(rootPath, '/script/tdd_log.json');

    try {
      const tddLogContent = this.readTddLogFile(tddLogPath);
      const tddLogJson = this.parseJson(tddLogContent);
      const gitInfo = {};
      const body = this.createApiRequestBody(tddLogJson, gitInfo);
      const response = await this.getTDDFeedback(body);

      this.handleApiResponse(response);
    } catch (err) {
      this.handleError(err);
    }
  }

  private createApiRequest(data: string, resolve: (value: string) => void, reject: (reason?: any) => void): http.ClientRequest {
    return http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => this.handleApiResponseStream());
  }

  private handleApiResponseStream(): void {}
}
