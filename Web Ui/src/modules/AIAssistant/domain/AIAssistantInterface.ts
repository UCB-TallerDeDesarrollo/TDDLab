import { AIRequest, AIResponse } from "./AIAssistantRepositoryInterface";

interface AIAssistantInterface {
  sendQuery(request: AIRequest): Promise<AIResponse>;
}

export default AIAssistantInterface;