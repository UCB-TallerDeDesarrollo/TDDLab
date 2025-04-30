import { AIRequest } from "../domain/AIAssistantRepositoryInterface";
import LlmRepositoryInterface from "../domain/AIAssistantInterface";

export class AnalyzeCode {
  constructor(
    private readonly llmRepository: LlmRepositoryInterface
  ) {}

  async execute(repoUrl: string, type: "Analiza" | "Refactoriza"): Promise<string> {
    const request: AIRequest = {
      query: type,
      repoUrl: repoUrl
    };
    
    const response = await this.llmRepository.sendQuery(request);
    return response.result;
  }
}