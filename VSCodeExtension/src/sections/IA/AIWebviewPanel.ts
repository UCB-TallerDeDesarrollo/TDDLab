import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class AIWebviewPanel {
  public static currentPanel: AIWebviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly messages: string[] = [];

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }

  public static async createOrShow() {
    const column = vscode.ViewColumn.Beside;

    if (AIWebviewPanel.currentPanel) {
      await AIWebviewPanel.currentPanel.fetchResponse();
      AIWebviewPanel.currentPanel.panel.reveal(column);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'aiPanel',
        'Asistente de IA',
        column,
        { enableScripts: true }
      );
      AIWebviewPanel.currentPanel = new AIWebviewPanel(panel);
      await AIWebviewPanel.currentPanel.fetchResponse();

      panel.onDidDispose(() => {
        AIWebviewPanel.currentPanel = undefined;
      });
    }
  }

  private update() {
    const messagesHtml = this.createMessagesHtml();
    this.panel.webview.html = this.generateHtmlContent(messagesHtml);
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

  private async fetchResponse() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const tddLogPath = path.join(rootPath, '/script/tdd_log.json');

    try {
      const tddLogContent = this.readTddLogFile(tddLogPath);
      const tddLogJson = this.parseJson(tddLogContent);

      const body = JSON.stringify({
        tddlog: tddLogJson,
      });
      const response = await this.getTDDFeedback(body);

      this.handleApiResponse(response);
    } catch (err) {
      this.handleError(err);
    }
  }


  private readTddLogFile(tddLogPath: string): string {
    return fs.readFileSync(tddLogPath, 'utf-8');
  }

  private parseJson(content: string): any {
    return JSON.parse(content);
  }

  private async handleApiResponse(response: string): Promise<void> {
    this.messages.push(response);
    this.update();
  }

  private handleError(err: any): void {
    console.error(err);
    this.messages.push('Error leyendo archivos o llamando a la API');
    this.update();
  }

  private getTDDFeedback(data: string): Promise<string> {
    return new Promise(resolve => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      resolve(`Hora actual: ${timeString}`);
    });
  }



}
