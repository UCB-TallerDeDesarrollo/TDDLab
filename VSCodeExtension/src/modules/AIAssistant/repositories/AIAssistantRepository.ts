import * as http from "http";

class AIAssistantRepository {
  private createApiRequestBody(tddLog: any, prompt: string): string {
    return JSON.stringify({
      tddlog: tddLog,
      prompt: prompt,
    });
  }

  private handleApiResponseStream(res: http.IncomingMessage, resolve: (value: string) => void): void {
    let responseData = "";

    res.on("data", (chunk) => (responseData += chunk));
    res.on("end", () => {
      try {
        const parsed = JSON.parse(responseData);
        resolve(`Respuesta IA: ${parsed.generatedText}`);
      } catch {
        resolve(`Respuesta no válida: ${responseData}`);
      }
    });
  }

  private createApiRequest(data: string, resolve: (value: string) => void, reject: (reason?: any) => void): http.ClientRequest {
    return http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => this.handleApiResponseStream(res, resolve)
    );
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
}

export default AIAssistantRepository;
