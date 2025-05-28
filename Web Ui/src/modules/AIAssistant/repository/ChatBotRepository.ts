import axios from 'axios';
import { VITE_API } from "../../../../config";

const API_URL = VITE_API + "/AIAssistant/chatbot";

export class ChatbotRepository {
  async sendMessage(message: string): Promise<string> {
    try {
      const { data } = await axios.post(API_URL, { input: message });
      return data.result;
    } catch (error) {
      console.error("Error en la API del chatbot:", error);
      throw new Error("Error en la conexión con el servidor");
    }
  }
}

