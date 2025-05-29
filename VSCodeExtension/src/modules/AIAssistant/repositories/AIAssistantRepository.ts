import * as https from "https";
import FileRepository from "./FileRepository";
import * as vscode from "vscode";
import { IncomingMessage } from "http"; // <--- IMPORTANTE

class AIAssistantRepository {
  private createApiRequestBody(tddLog: any, prompt: string): string {
    return JSON.stringify({
      tddlog: tddLog,
      prompt: prompt,
    });
  }

  private handleApiResponseStream(res: IncomingMessage, resolve: (value: string) => void): void {
    let responseData = "";

    res.on("data", (chunk) => (responseData += chunk));
    res.on("end", () => {
      try {
        const parsed = JSON.parse(responseData);
        resolve(`Respuesta IA: ${parsed.analysis}`);
      } catch {
        resolve(`Respuesta no válida: ${responseData}`);
      }
    });
  }

  private createApiRequest(data: string,resolve: (value: string) => void,reject: (reason?: any) => void): ReturnType<typeof https.request> {
    return https.request(
      {
        hostname: "tdd-lab-api-staging.vercel.app",
        path: "/api/AIAssistant/analyze-tdd-extension",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => this.handleApiResponseStream(res, resolve)
    ).on("error", reject);
  }

  private getTDDFeedback(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = this.createApiRequest(data, resolve, reject);
      req.write(data);
      req.end();
    });
  }

  public async getTDDFeedbackFromAI(tddLog: any, prompt: string) {
    const body = this.createApiRequestBody(tddLog, prompt);
    console.log("BODY", body);
    const response = await this.getTDDFeedback(body);
    return response;
  }
  public async fetchResponse(context: vscode.ExtensionContext, fileRepo: FileRepository): Promise<string> {
    try {
      const tddLog = fileRepo.getTDDLog();
      const prompt = fileRepo.getPrompt();
      return await this.getTDDFeedbackFromAI(tddLog, prompt);
    } catch (error) {
      console.error("Error en fetchResponse:", error);
      throw error;
    }
  }
}

export default AIAssistantRepository;
