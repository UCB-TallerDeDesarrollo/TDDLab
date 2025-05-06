// src/modules/Chatbot/application/ChatbotService.ts
import { ChatbotRepository } from "../repositories/ChatbotRepository";  // Asegúrate de que la ruta esté correcta

export class ChatbotService {
  static async handleChatRequest(prompt: string): Promise<string> {
    // Llamamos al repositorio para obtener la respuesta de la API con el prompt
    const response = await ChatbotRepository.callChatbotAPI(prompt);
    return response;
  }
}
