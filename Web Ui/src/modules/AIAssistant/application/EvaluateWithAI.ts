import { AIRequest } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import AIAssistantRepository from "../repository/AIAssistantRepository";

export class EvaluateWithAI {
  private readonly aIAssistantInterface: AIAssistantInterface;

  constructor() {
    this.aIAssistantInterface = new AIAssistantRepository();
  }

  async execute(repoUrl: string, type: "analiza" | "refactoriza"| "califica"): Promise<string> {
    const request: AIRequest = {
      query: type,
      repoUrl: repoUrl
    };

    const response = await this.aIAssistantInterface.sendQuery(request);
    return response.result;
  }
}