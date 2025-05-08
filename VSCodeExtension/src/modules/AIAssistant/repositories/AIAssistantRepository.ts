import * as http from "http";

class AIAssistantRepository {
  // Método para obtener retroalimentación desde la API
  public async getTDDFeedbackFromAI(tddLog: any, prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = this.createApiRequest(tddLog, prompt, resolve, reject);
      req.write(JSON.stringify({ tddlog: tddLog, prompt: prompt }));
      req.end();
    });
  }

  private createApiRequest(tddLog: any, prompt: string, resolve: (value: string) => void, reject: (reason?: any) => void): http.ClientRequest {
    return http.request(
      {
        hostname: "localhost",  // Asegúrate de que sea el correcto
        port: 3000,
        path: "/api/AIAssistant/analyze-tdd-extension",  // Ruta de la API
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(JSON.stringify({ tddlog: tddLog, prompt: prompt })),
        },
      },
      (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed.analysis);  // Suponiendo que el campo de respuesta es 'analysis'
          } catch (error) {
            reject("Error al procesar la respuesta");
          }
        });
      }
    );
  }
}

export default AIAssistantRepository;
