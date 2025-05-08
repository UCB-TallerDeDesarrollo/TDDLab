import AIAssistantRepository from "../repositories/AIAssistantRepository";
import FileRepository from "../repositories/FileRepository";
import * as vscode from "vscode";

export class GetTDDFeedbackFromAI {
  // Asegúrate de que la propiedad fileRepository esté declarada solo una vez
  private readonly fileRepository: FileRepository;

  constructor(
    private readonly aIAssistantRepository: AIAssistantRepository = new AIAssistantRepository(),
    fileRepository: FileRepository = new FileRepository()  // Ahora se pasa solo una vez
  ) {
    this.fileRepository = fileRepository; // Asignación de fileRepository al atributo de la clase
  }

  public async getTDDFeedbackFromAI(tddLog: any, prompt: string): Promise<string> {
    const body = this.createApiRequestBody(tddLog, prompt);
    console.log("BODY", body);
    const response = await this.fetchResponse(tddLog, prompt); // Usamos ambos parámetros
    return response;
  }

  private async fetchResponse(tddLog: any, prompt: string): Promise<string> {
    try {
      // Llamamos al repositorio y pasamos ambos parámetros
      const responseFromAIAssistantRepository = await this.aIAssistantRepository.getTDDFeedbackFromAI(tddLog, prompt);
      return responseFromAIAssistantRepository;
    } catch (error) {
      console.error("Error en el fetch response", error);
      throw error;
    }
  }

  private createApiRequestBody(tddLog: any, prompt: string): string {
    return JSON.stringify({
      tddlog: tddLog,
      prompt: prompt,
    });
  }
}
