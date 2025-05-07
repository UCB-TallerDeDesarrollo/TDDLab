import * as vscode from "vscode";
import { GetTDDFeedbackFromAI } from "../../modules/AIAssistant/application/GetTDDFeedbackFromAI";

export class AIAssistantPanel {
  private readonly panel: vscode.WebviewPanel;
  private readonly messages: string[] = [];
  private readonly context: vscode.ExtensionContext;
  private readonly feedbackAssistant: GetTDDFeedbackFromAI =
    new GetTDDFeedbackFromAI();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.panel = vscode.window.createWebviewPanel(
      "aiPanel",
      "Asistente de IA",
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
    return this.messages.map((msg) => `<p>${msg}</p>`).join("");
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
    this.messages.push("Error leyendo archivos o llamando a la API");
    this.update();
  }

  private async handleApiResponse(response: string) {
    console.log("RESPUESTAAAA", response);
    this.messages.push(response);
    this.update();
  }

  public async getTDDFeedbackFromAI() {
    try {
      const response = await this.feedbackAssistant.fetchResponse(this.context);

      this.handleApiResponse(response);
    } catch (err) {
      this.handleError(err);
    }
  }
}
