import { AIRequest, AIResponse, AIPromptResponse, UpdatePromptsRequest } from "./AIAssistantRepositoryInterface";

interface AIAssistantInterface {
  sendQuery(request: AIRequest): Promise<AIResponse>;
  getPrompts(): Promise<AIPromptResponse>;
  updatePrompts(request: UpdatePromptsRequest): Promise<AIPromptResponse>;
}

export default AIAssistantInterface;