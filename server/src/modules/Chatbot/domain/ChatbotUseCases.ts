// src/modules/chatbot/domain/ChatbotUseCases.ts
import { ChatbotRepository } from "../repositories/ChatbotRepository";  // Asegúrate de que la ruta esté correcta

export class ChatbotUseCases {
  static async processPrompt(prompt: string): Promise<string> {
    // Llamamos al repositorio (mock) para obtener la respuesta
    const response = await ChatbotRepository.callChatbotAPI(prompt);
    return response;
  }
}
