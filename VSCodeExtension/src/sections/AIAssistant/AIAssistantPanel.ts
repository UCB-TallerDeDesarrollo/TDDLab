import * as vscode from "vscode";
import { GetTDDFeedbackFromAI } from "../../modules/AIAssistant/application/GetTDDFeedbackFromAI"; // Asegúrate de que esté bien importado

// Definir tipo para los mensajes que recibimos del Webview fuera de la clase
interface WebviewMessage {
  type: string;
  text: string;
}

export class AIAssistantPanel {
  private panel: vscode.WebviewPanel | undefined;
  private readonly messages: string[] = [];  // Lista de mensajes en el chat
  private readonly context: vscode.ExtensionContext;
  private readonly feedbackAssistant: GetTDDFeedbackFromAI;  // Instancia de la clase GetTDDFeedbackFromAI
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
    this.feedbackAssistant = new GetTDDFeedbackFromAI();  // Crear una nueva instancia de GetTDDFeedbackFromAI

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

      // Escuchar mensajes del Webview
      this.panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
        if (message.type === 'userMessage') {
          const userMessage = message.text;
          this.processUserMessage(userMessage); // Llamar al método que procesa el mensaje
        }
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
    return this.messages.map((msg) => `<p>${msg}</p>`).join("");  // Generamos el HTML con los mensajes
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
          ${messagesHtml}  <!-- Aquí se inyectan los mensajes -->
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
      this.panel.webview.html = this.generateHtmlContent(messagesHtml);  // Actualizamos el contenido de la webview
    }
  }

  // Lógica para manejar los mensajes del usuario y procesarlos
  private async processUserMessage(userMessage: string) {
    try {
      // Agregar el mensaje del usuario al chat
      this.messages.push(`💬 Usuario: ${userMessage}`);

      // Preparamos el tddLog (puedes ajustar esta parte según el formato que estés usando)
      const tddLog = this.prepareTddLog(userMessage);  
      const prompt = "Analizar TDD y generar feedback"; // El prompt para la IA

      // Aquí pasamos ambos parámetros: tddLog y prompt
      const response = await this.feedbackAssistant.getTDDFeedbackFromAI(tddLog, prompt);

      // Agregar la respuesta de la IA al chat
      this.messages.push(`🤖 IA: ${response}`);
      this.update();  // Actualizamos la webview para mostrar los nuevos mensajes
    } catch (error) {
      console.error("Error procesando el mensaje del usuario", error);
      this.messages.push("Error al procesar el mensaje");
      this.update();  // Actualizamos la webview incluso en caso de error
    }
  }

  // Método para preparar el tddLog
  private prepareTddLog(userMessage: string) {
    return {
      testResult: userMessage,  // Este es un ejemplo; puedes usar una estructura más compleja
      timestamp: new Date().toISOString(),
    };
  }

  // Método para obtener retroalimentación desde la IA (llamada que se hace desde ExecuteAIAssistant)
  public async getTDDFeedbackFromAI() {
    try {
      // Obtener retroalimentación de la IA
      const response = await this.feedbackAssistant.getTDDFeedbackFromAI(
        { testResult: 'Dummy TDD result', timestamp: new Date().toISOString() }, 
        "Analizar TDD y generar feedback" 
      );
      
      // Mostrar la respuesta
      console.log("Respuesta de la IA: ", response);

      this.messages.push(`🤖 IA: ${response}`);
      this.update();
    } catch (error) {
      console.error("Error al obtener la retroalimentación de la IA", error);
      this.messages.push("Error al obtener la retroalimentación de la IA");
      this.update();
    }
  }
}
