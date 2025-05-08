import * as vscode from "vscode";
import { GetTDDFeedbackFromAI } from "../../modules/AIAssistant/application/GetTDDFeedbackFromAI";

export class AIAssistantPanel {
  private panel: vscode.WebviewPanel | undefined;
  private readonly messages: string[] = [];
  private readonly context: vscode.ExtensionContext;
  private readonly feedbackAssistant: GetTDDFeedbackFromAI = new GetTDDFeedbackFromAI();
  private static instance: AIAssistantPanel | undefined;

  // Método para obtener la instancia única de AIAssistantPanel
  public static getInstance(context: vscode.ExtensionContext): AIAssistantPanel {
    if (!AIAssistantPanel.instance) {
      AIAssistantPanel.instance = new AIAssistantPanel(context);
      AIAssistantPanel.instance.showInfoMessage(); // Mostrar el mensaje solo cuando se crea la instancia
    }
    return AIAssistantPanel.instance;
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;

    // Crear el panel webview solo si no existe
    if (!this.panel) {
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
    }
  }

  // Mostrar mensaje informativo solo al crear la instancia
  private showInfoMessage() {
    vscode.window.showInformationMessage(
      "Para evitar que el panel del Asistente de IA aparezca vacío al reiniciar VS Code, por favor, ciérrelo manualmente antes de cerrar la aplicación."
    );
  }

  // Método para mostrar el panel o crearlo si no existe
  public reveal() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
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
    }
    this.update();
  }

  // Método para limpiar y eliminar la instancia
  public dispose() {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
      AIAssistantPanel.instance = undefined;
    }
  }

  // Callback para manejar la disposición del panel
  public onDispose(callback: () => void) {
    if (this.panel) {
      this.panel.onDidDispose(callback);
    }
  }

  // Método para crear los mensajes en formato HTML
  private createMessagesHtml(): string {
    return this.messages.map((msg) => `<p>${msg}</p>`).join("");
  }

  // Método para generar el contenido HTML
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
          #chat-box { margin-bottom: 1rem; max-height: 400px; overflow-y: auto; }
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
          document.getElementById('chat-form').addEventListener('submit', event => {
            event.preventDefault();
            const input = document.getElementById('user-input');
            const message = input.value;
            if (message.trim()) {
              vscode.postMessage({ type: 'userMessage', text: message });
              input.value = '';
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  // Método para actualizar la webview con los mensajes más recientes
  public update() {
    if (this.panel) {
      const messagesHtml = this.createMessagesHtml();
      this.panel.webview.html = this.generateHtmlContent(messagesHtml);
    }
  }

  // Manejo de errores de la API
  private handleError(err: any): void {
    console.error(err);
    this.messages.push("Error leyendo archivos o llamando a la API");
    this.update();
  }

  // Manejo de la respuesta de la API
  private async handleApiResponse(response: string) {
    console.log("RESPUESTAAAA", response);
    this.messages.push(response);
    this.update();
  }

  // Método para obtener el feedback del TDD de la IA y luego habilitar el chat
  public async getTDDFeedbackFromAI() {
    try {
      // Primero obtenemos la retroalimentación del TDD
      const response = await this.feedbackAssistant.fetchResponse(this.context);
      this.handleApiResponse(response);

      // Después de mostrar la retroalimentación, habilitamos el chat
      this.messages.push("🤖 IA: ¡El chat ahora está disponible!");
      this.update(); // Actualizamos la webview después de mostrar el chat
    } catch (err) {
      this.handleError(err);
    }
  }
}
