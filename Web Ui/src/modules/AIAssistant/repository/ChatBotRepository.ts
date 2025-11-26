import axios from 'axios';
import { VITE_API } from "../../../../config";

const API_URL = VITE_API + "/AIAssistant/chatbot";

export class ChatbotRepository {
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await axios.post(API_URL, { input: message }, { withCredentials: true });
      return response.data.result ?? "No hubo respuesta del asistente.";
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        if (error.response?.status === 403) {
          throw new Error("No tienes permisos para acceder a esta funcionalidad.");
        }
        if (error.response?.status === 500) {
          throw new Error("Error interno del servidor. Por favor, intenta más tarde.");
        }
      }
      throw new Error("Error en la conexión con el servidor");
    }
  }
}
