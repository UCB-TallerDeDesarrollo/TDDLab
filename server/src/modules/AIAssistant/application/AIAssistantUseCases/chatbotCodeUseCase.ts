import { AIAssistantAnswerObject } from "../../domain/AIAssistant";
import { ChatbotAssistantRepository } from "../../repository/ChatbotAssistantRepository";

export class ChatbotCodeUseCase {
  private readonly adapter: ChatbotAssistantRepository;

  constructor(adapter: ChatbotAssistantRepository) {
    this.adapter = adapter;
  }

  async execute(input: string): Promise<AIAssistantAnswerObject | any> {
    try {
      if (!input?.trim()) {
        throw new Error("El mensaje no puede estar vacío");
      }

      const response = await this.adapter.sendMessage(input.trim());

      return response;
    } catch (error) {
      console.error('Error en ChatbotCodeUseCase:', error);
      
      throw error;
    }
  }
}