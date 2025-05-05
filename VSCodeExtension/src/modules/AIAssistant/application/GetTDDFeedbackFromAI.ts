import AIAssistantRepository from "../repositories/AIAssistantRepository";
import TDDLogRepository from "../repositories/TDDLogRepository";
import PromptRepository from "../repositories/PromptRepository";
import * as vscode from "vscode";

export class GetTDDFeedbackFromAI {
  constructor(
    private readonly tDDLogRepository: TDDLogRepository = new TDDLogRepository(),
    private readonly promptRepository: PromptRepository = new PromptRepository(),
    private readonly aIAssistantRepository: AIAssistantRepository = new AIAssistantRepository()
  ) {}

  public async fetchResponse(context: vscode.ExtensionContext) {
    try {
      const responseFromTDDLogRepository = this.tDDLogRepository.getTDDLog();
      const responseFromPromptRepository = this.promptRepository.getPrompt(context);
      const responseFromAIAssistantRepository =
        await this.aIAssistantRepository.getTDDFeedbackFromAI(
          responseFromTDDLogRepository,
          responseFromPromptRepository
        );
      return responseFromAIAssistantRepository;
    } catch (error) {
      console.error("Error en el fetch response", error);
      throw error;
    }
  }
}
