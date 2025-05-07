import { AIRequest, AIResponse, AIPromptResponse } from "./AIAssistantRepositoryInterface";

interface AIAssistantInterface {
  sendQuery(request: AIRequest): Promise<AIResponse>;
  getPrompts(): Promise<AIPromptResponse>;
}

export default AIAssistantInterface;