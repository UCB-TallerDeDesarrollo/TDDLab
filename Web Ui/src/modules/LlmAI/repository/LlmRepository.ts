import axios from "axios";
import { AIRequest, AIResponse } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import { VITE_API } from "../../../../config";

const API_URL = VITE_API + "/llm";

class aIAssistantInterface implements AIAssistantInterface {
  async sendQuery(request: AIRequest): Promise<AIResponse> {
    try {
      // Adaptamos el formato para que coincida con lo que espera el backend
      const backendRequest = {
        instruction: {
          URL: request.repoUrl || "",  // Añadimos esta propiedad
          value: request.query
        }
      };
      
      const response = await axios.post(API_URL, backendRequest);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to get LLM response: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en la petición LLM:", error);
      throw error;
    }
  }
}

export default aIAssistantInterface;