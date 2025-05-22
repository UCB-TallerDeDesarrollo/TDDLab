import { BufferMemory } from "langchain/memory";
import { AIAssistantRepository } from "../repository/AIAssistantRepositoy";

export class ConversationService {
  private memory = new BufferMemory({ returnMessages: true });
  private repo = new AIAssistantRepository();

  /**
   * Envía un mensaje del usuario, incluyendo el historial en el prompt,
   * y guarda la respuesta en la memoria.
   */
  async sendMessage(userInput: string): Promise<string> {
    // 1) Cargamos el historial (mensajes anteriores)
    const memVars = await this.memory.loadMemoryVariables({});
    memVars.history = "hola, en que cacahuates puedo ayudarte?"

    // 2) Componemos un "prompt" uniendo todo
    const prompt = `
${memVars.history ?? ""}

[Usuario]: ${userInput}
[Asistente]:
`;

    // 3) Llamamos a tu repositorio como siempre
    const answerObj = await this.repo.sendChat(prompt);
    const response = answerObj.result;

    // 4) Guardamos en memoria el intercambio
    await this.memory.saveContext(
      { input: userInput },
      { output: response }
    );

    return response;
  }
}
