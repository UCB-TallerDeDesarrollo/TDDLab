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

}
