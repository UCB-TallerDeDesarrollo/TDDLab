import { LlmRequestObject } from "../domain/llmInterfaces";
import LlmRepositoryInterface from "../domain/LlmRepositoryInterface";

export class AnalyzeCode {
  constructor(
    private readonly llmRepository: LlmRepositoryInterface
  ) {}

  async execute(repoUrl: string, type: "Analiza" | "Refactoriza"): Promise<string> {
    const request: LlmRequestObject = {
      prompt: type,
      repoUrl: repoUrl
    };
    
    const response = await this.llmRepository.sendPrompt(request);
    return response.result;
  }
}