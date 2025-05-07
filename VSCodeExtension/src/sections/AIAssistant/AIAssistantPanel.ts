import * as vscode from "vscode";
import { GetTDDFeedbackFromAI } from "../../modules/AIAssistant/application/GetTDDFeedbackFromAI";

export class AIAssistantPanel {
  private panel: vscode.WebviewPanel | undefined;
  private readonly messages: string[] = [];
  private readonly context: vscode.ExtensionContext;
  private readonly feedbackAssistant: GetTDDFeedbackFromAI =
    new GetTDDFeedbackFromAI();
  private static instance: AIAssistantPanel | undefined;

  public static getInstance(context: vscode.ExtensionContext): AIAssistantPanel {
    if (!AIAssistantPanel.instance) {
      AIAssistantPanel.instance = new AIAssistantPanel(context);
    }
    return AIAssistantPanel.instance;
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;

    // Crear el panel
    this.panel = vscode.window.createWebviewPanel(
      "aiPanel",
      "Asistente de IA",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    this.panel.onDidDispose(() => {
      // Limpiar la referencia cuando el panel se cierre
      this.panel = undefined;
      AIAssistantPanel.instance = undefined; // Limpiar la instancia
    });

    this.update(); // Actualiza el contenido del panel
  }

  public reveal() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      // Si el panel no existe (porque se cerró), crearlo de nuevo
      this.panel = vscode.window.createWebviewPanel(
        "aiPanel",
        "Asistente de IA",
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
        AIAssistantPanel.instance = undefined;
      });
      this.update();
    }
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
      AIAssistantPanel.instance = undefined;
    }
  }

  public onDispose(callback: () => void) {
    if (this.panel) {
      this.panel.onDidDispose(callback);
    }
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
    if (this.panel) {
      const messagesHtml = this.createMessagesHtml();
      this.panel.webview.html = this.generateHtmlContent(messagesHtml);
    }
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