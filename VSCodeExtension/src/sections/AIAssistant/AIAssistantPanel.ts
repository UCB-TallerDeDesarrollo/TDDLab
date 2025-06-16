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
     return this.messages
    .map((msg) => {
      const isUser = msg.startsWith("💬 Usuario:");
      const cleanMsg = msg.replace("💬 Usuario: ", "").replace("🤖 IA: ", "");
      const formattedMsg = cleanMsg
        .split("\n")
        .map((line) => `<div>${line}</div>`)
        .join("");
      return `
        <div class="${isUser ? "user-message" : "ai-message"}">
          ${formattedMsg}
        </div>
      `;
    })
    .join("");
  }

  private generateHtmlContent(messagesHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body, html {
          padding: 1rem;
          margin: 0;
          height: 100%;
          background-color: black !important;
          color: white !important;
          font-family: sans-serif;
          }

          h1 {
            color: #00bfff;
          }

          #chat-box {
            margin-bottom: 1rem;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #444;
            padding: 0.5rem;
          }

          form {
            display: flex;
            gap: 0.5rem;
          }

          input[type="text"] {
            flex: 1;
            padding: 0.5rem;
            background-color: #222;
            color: white;
            border: 1px solid #555;
          }

          button {
            padding: 0.5rem 1rem;
            background-color: #333;
            color: white;
            border: 1px solid #555;
          }

          .user-message {
            background-color: #004d4d;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }

          .ai-message {
            background-color: #333300;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            white-space: pre-wrap;
          }
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
          const form = document.getElementById('chat-form');

          form.addEventListener('submit', event => {
            event.preventDefault();
            const input = document.getElementById('user-input');
            const message = input.value;
            if (message.trim()) {
              vscode.postMessage({ type: 'userMessage', text: message });
              input.value = '';
            }
          });

          // Scroll automático al final cuando carga el HTML
          window.addEventListener('load', () => {
            chatBox.scrollTop = chatBox.scrollHeight;
          });
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
