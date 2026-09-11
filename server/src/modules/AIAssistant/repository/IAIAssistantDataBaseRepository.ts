import { AIAssistantPromptObject } from '../domain/AIAssistant';

export interface IAIAssistantDataBaseRepository {
  getPrompts(): Promise<AIAssistantPromptObject>;
  updatePrompts(prompt: AIAssistantPromptObject): Promise<AIAssistantPromptObject>;
}
