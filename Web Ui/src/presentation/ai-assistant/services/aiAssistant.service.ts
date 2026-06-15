import { ChatbotUseCase } from "../../../modules/AIAssistant/application/ChatbotUseCase";
import { EvaluateWithAI } from "../../../modules/AIAssistant/application/EvaluateWithAI";
import { AssistantAction } from "../types/aiAssistant.types";

const evaluateWithAIUseCase = new EvaluateWithAI();
const chatbotUseCase = new ChatbotUseCase();

export function sendChatMessage(message: string) {
  return chatbotUseCase.sendMessage(message);
}

export function evaluateRepository(repositoryLink: string, action: AssistantAction) {
  return evaluateWithAIUseCase.execute(repositoryLink, action);
}
