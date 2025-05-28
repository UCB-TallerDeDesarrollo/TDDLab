import { AIAssistantAnswerObject } from "../../domain/AIAssistant";
import { ChatbotAssistantRepository } from "../../repository/ChatbotAssistantRepository";

export class ChatbotCodeUseCase {
  private readonly adapter: ChatbotAssistantRepository;

  constructor(adapter: ChatbotAssistantRepository) {
    this.adapter = adapter;
  }

  async execute(input: string): Promise<AIAssistantAnswerObject | any> {
    try {
      if (!input || !input.trim()) {
        throw new Error("El mensaje no puede estar vacío");
      }

      console.log('Procesando mensaje:', input);

      const response = await this.adapter.sendMessage(input.trim());
      
      console.log('Respuesta generada:', response);
      
      return response;
    } catch (error) {
      console.error('Error en ChatbotCodeUseCase:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error en el caso de uso del chatbot",
        response: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo."
      };
    }
  }
}