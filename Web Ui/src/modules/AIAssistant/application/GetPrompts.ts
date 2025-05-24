import { AIPromptResponse } from "../domain/AIAssistantRepositoryInterface";
import AIAssistantInterface from "../domain/AIAssistantInterface";
import AIAssistantRepository from "../repository/AIAssistantRepository";

export class GetPrompts {
  private readonly aIAssistantInterface: AIAssistantInterface;

  constructor() {
    this.aIAssistantInterface = new AIAssistantRepository();
  }

  async execute(): Promise<AIPromptResponse> {
    try {
      const response = await this.aIAssistantInterface.getPrompts();
      return response;
    } catch (error) {
      console.error("Error al obtener los prompts:", error);
      return {
        tddPrompt: "Error al cargar el prompt de TDD",
        refactoringPrompt: "Error al cargar el prompt de Refactoring",
        evaluateTDDPrompt: "Error al cargar el prompt de Evaluación de TDD"
      };
    }
  }
}