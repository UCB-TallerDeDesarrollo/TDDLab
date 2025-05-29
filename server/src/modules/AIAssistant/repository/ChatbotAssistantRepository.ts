import { BufferMemory } from "langchain/memory";
import { AIAssistantRepository } from "./AIAssistantRepositoy";
import { AIAssistantAnswerObject } from "../domain/AIAssistant";

export class ChatbotAssistantRepository {
  private readonly bufferMemory = new BufferMemory({ returnMessages: true });
  private readonly aiAssistantRepository = new AIAssistantRepository;

  async sendMessage(userInput: string): Promise<AIAssistantAnswerObject> {
    try {
      const memory = await this.bufferMemory.loadMemoryVariables({});
      let historyText = "";
      if (memory.history && Array.isArray(memory.history)) {
        historyText = memory.history
          .map((msg: any) => {
            const role = msg.constructor.name === 'HumanMessage' || msg._getType() === 'human' ? 'Usuario' : 'Asistente';
            return `${role}: ${msg.content}`;
          }).join('\n');
      }

      let chatHistory: string;
      if (historyText) {
        chatHistory = `Conversación anterior: ${historyText} Usuario: ${userInput} Asistente:`;
      } else {
        chatHistory = `Usuario: ${userInput} Asistente:`;
      }

      const answerLLM = await this.aiAssistantRepository.sendChat(chatHistory, userInput);

      await this.bufferMemory.saveContext(
        { input: userInput },
        { output: answerLLM.result }
      );

      return answerLLM;
    } catch (error) {
      console.error('[ConversationService Error]', error);
      
      if (error instanceof Error) {
        throw new Error(`Error al procesar la conversación: ${error.message}`);
      } else {
        throw new Error("Error desconocido al procesar la conversación");
      }
    }
  }
}