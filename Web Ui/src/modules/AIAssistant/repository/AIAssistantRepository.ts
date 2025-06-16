import axios from "axios";
import { AIRequest, AIResponse, AIPromptResponse, UpdatePromptsRequest } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import { VITE_API } from "../../../../config";

const API_URL = VITE_API + "/AIAssistant";

class AIAssistantRepository implements AIAssistantInterface {
  async sendQuery(request: AIRequest): Promise<AIResponse> {
    try {
      const backendRequest = {
        instruction: {
          URL: request.repoUrl ?? "",
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

  async getPrompts(): Promise<AIPromptResponse> {
    try {
      const response = await axios.get(API_URL);

      if (response.status === 200) {
        return {
          tddPrompt: response.data.tdd_analysis ?? "",
          refactoringPrompt: response.data.refactoring ?? "",
          evaluateTDDPrompt: response.data.evaluation ?? ""
        };
      } else {
        throw new Error(`Error al obtener prompts: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al obtener los prompts:", error);
      throw error;
    }
  }

  async updatePrompts(request: UpdatePromptsRequest): Promise<AIPromptResponse> {
    try {
      const response = await axios.put(API_URL, request);

      if (response.status === 200) {
        return {
          tddPrompt: response.data.tdd_analysis ?? "",
          refactoringPrompt: response.data.refactoring ?? "",
          evaluateTDDPrompt: response.data.evaluation ?? ""
        };
      } else {
        throw new Error(`Error al actualizar prompts: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al actualizar los prompts:", error);
      throw error;
    }
  }
}

export default AIAssistantRepository;