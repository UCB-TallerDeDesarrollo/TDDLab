import * as vscode from "vscode";
import { GetTDDFeedbackFromAI } from "../../modules/AIAssistant/application/GetTDDFeedbackFromAI";

interface WebviewMessage {
  type: string;
  text: string;
}

export class AIAssistantPanel {
  private panel: vscode.WebviewPanel | undefined;
  private readonly messages: string[] = [];
  private readonly context: vscode.ExtensionContext;
  private readonly feedbackAssistant: GetTDDFeedbackFromAI;
  private static instance: AIAssistantPanel | undefined;
  private initialFeedbackDisplayed: boolean = false;

  public static getInstance(context: vscode.ExtensionContext): AIAssistantPanel {
    if (!AIAssistantPanel.instance) {
      AIAssistantPanel.instance = new AIAssistantPanel(context);
      AIAssistantPanel.instance.showInfoMessage();
    }
    return AIAssistantPanel.instance;
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.feedbackAssistant = new GetTDDFeedbackFromAI();

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

    this.panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
      if (message.type === "userMessage") {
        this.processUserMessage(message.text);
      }
    });

  }


  private showInfoMessage() {
    vscode.window.showInformationMessage(
      "Para evitar que el panel del Asistente de IA aparezca vacío al reiniciar VS Code, ciérrelo manualmente antes de cerrar la aplicación."
    );
  }

  public reveal() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    }
    this.update();
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
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: sans-serif; padding: 1rem; }
          h1 { color: #007acc; }
          #chat-box { margin-bottom: 1rem; max-height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 0.5rem; }
          form { display: flex; gap: 0.5rem; }
          input[type="text"] { flex: 1; padding: 0.5rem; }
          button { padding: 0.5rem 1rem; }
        </style>
      </head>
      <body>
        <h1>Asistente de IA</h1>
        <div id="chat-box">
          ${messagesHtml}
        </div>
        <form id="chat-form">
          <input type="text" id="user-input" placeholder="Escribe tu mensaje..." />
          <button type="submit">Enviar</button>
        </form>
        <script>
          const vscode = acquireVsCodeApi();
          const chatBox = document.getElementById('chat-box');
          document.getElementById('chat-form').addEventListener('submit', event => {
            event.preventDefault();
            const input = document.getElementById('user-input');
            const message = input.value;
            if (message.trim()) {
              vscode.postMessage({ type: 'userMessage', text: message });
              input.value = '';
            }
          });

          // Scroll automático al final cuando carga el HTML
          chatBox.scrollTop = chatBox.scrollHeight;
        </script>
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

  private async processUserMessage(userMessage: string) {
    try {
      this.messages.push(`💬 Usuario: ${userMessage}`);
      // Cambia getSimpleResponse por fetchResponse, enviando el mensaje que quieras (o ignora el userMessage si siempre mandas el mismo TDDlog)
    
      const response = await this.feedbackAssistant.getSimpleResponse(userMessage);
      this.messages.push(`🤖 IA: ${response}`);
      this.update();
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error("Error procesando mensaje:", error);
    this.messages.push("❌ Error al procesar el mensaje.");
    this.update();
  }

  private async handleApiResponse(response: string) {
    console.log("RESPUESTAAAA", response);
    this.messages.push(`🤖 IA: ${response}`);
    this.update();
  }

  public async getTDDFeedbackFromAI() {
    try {
      const response = await this.feedbackAssistant.sendTDDLogAndGetFeedback(this.context);
      this.handleApiResponse(response);
    } catch (err) {
      this.handleError(err);
    }
  }
}
