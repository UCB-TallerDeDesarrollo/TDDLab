import AIAssistantRepository from "../repositories/AIAssistantRepository";
import FileRepository from "../repositories/FileRepository";
import * as vscode from "vscode";

export class GetTDDFeedbackFromAI {
  constructor(
    private readonly fileRepository: FileRepository = new FileRepository(),
    private readonly aIAssistantRepository: AIAssistantRepository = new AIAssistantRepository()
  ) {}

  public async fetchResponse(context: vscode.ExtensionContext) {
    try {
      const responseFromTDDLogRepository = this.fileRepository.getTDDLog();
      const responseFromPromptRepository = this.fileRepository.getPrompt();
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
