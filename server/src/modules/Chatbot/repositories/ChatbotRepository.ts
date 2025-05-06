// src/modules/Chatbot/repository/ChatbotRepository.ts
import dotenv from "dotenv";

dotenv.config();

// Usamos la URL definida en el archivo .env
//const LLM_API_URL = process.env.LLM_API_URL as string;

export class ChatbotRepository {
  // Simulamos la llamada a la API con un mock
  static async callChatbotAPI(prompt: string): Promise<string> {
    // Simulación de respuesta dependiendo del prompt
    return new Promise((resolve) => {
      if (prompt.toLowerCase().includes("hola")) {
        resolve("Hola, ¿en qué puedo ayudarte?");
      } else {
        resolve("No sé cómo responder a eso.");
      }
    });
  }
}
