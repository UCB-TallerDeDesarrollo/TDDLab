import AIAssistantRepository from "../repositories/AIAssistantRepository";
import FileRepository from "../repositories/FileRepository";
import * as vscode from "vscode";

export class GetTDDFeedbackFromAI {
  constructor(
    private readonly fileRepository: FileRepository = new FileRepository(),
    private readonly aIAssistantRepository: AIAssistantRepository = new AIAssistantRepository()
  ) {}
  
   public async sendTDDLogAndGetFeedback(context: vscode.ExtensionContext): Promise<string> {
    return await this.aIAssistantRepository.fetchResponse(context, this.fileRepository);
  }
  public async getSimpleResponse(prompt: string): Promise<string> {
    const tddlog = {};
    return await this.aIAssistantRepository.getTDDFeedbackFromAI(tddlog, prompt);
  }
}
