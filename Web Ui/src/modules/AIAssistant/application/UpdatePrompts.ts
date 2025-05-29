import { AIPromptResponse, UpdatePromptsRequest } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import AIAssistantRepository from "../repository/AIAssistantRepository";

export class UpdatePrompts {
  private readonly aIAssistantInterface: AIAssistantInterface;

  constructor() {
    this.aIAssistantInterface = new AIAssistantRepository();
  }

  async execute(tddPrompt: string, refactoringPrompt: string, evaluateTDDPrompt: string): Promise<AIPromptResponse> {
    try {
      const request: UpdatePromptsRequest = {
        tdd_analysis: tddPrompt,
        refactoring: refactoringPrompt,
        evaluation: evaluateTDDPrompt
      };

      const response = await this.aIAssistantInterface.updatePrompts(request);
      return response;
    } catch (error) {
      console.error("Error al actualizar los prompts:", error);
      throw error;
    }
  }
}