import axios from "axios";
import { AIRequest, AIResponse } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import { VITE_API } from "../../../../config";
// ai-assistant POSIBLE NOMBRE
const API_URL = VITE_API + "/llm";

class AIAssistantRepository implements AIAssistantInterface {
  async sendQuery(request: AIRequest): Promise<AIResponse> {
    try {
      const backendRequest = {
        instruction: {
          URL: request.repoUrl || "",
          value: request.query
        }
      };
      
      const response = await axios.post(API_URL, backendRequest);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error en la respuesta del asistente IA: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en la petición al asistente IA:", error);
      throw error;
    }
  }
}

export default AIAssistantRepository;