import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import simpleGit, { SimpleGit } from 'simple-git';

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


}
