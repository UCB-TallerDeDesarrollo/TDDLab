import { ChatbotAPI } from '../repository/ChatbotRepository';

export class ChatbotService {
  private readonly chatbotAPI: ChatbotAPI;

  constructor() {
    this.chatbotAPI = new ChatbotAPI();
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await this.chatbotAPI.sendMessage(message);
      return response;
    } catch (error: any) {
        throw new Error(`Error al enviar el mensaje al chatbot: ${error.message || error}`);
      }
  }
}

  