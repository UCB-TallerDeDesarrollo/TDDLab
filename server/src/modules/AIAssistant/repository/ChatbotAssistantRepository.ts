import { BufferMemory } from "langchain/memory";
import { AIAssistantRepository } from "./AIAssistantRepositoy";
import { AIAssistantAnswerObject } from "../domain/AIAssistant";

export class ChatbotAssistantRepository {
  private bufferMemory = new BufferMemory({ returnMessages: true });
  private aiAssistantRepository = new AIAssistantRepository;

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

      console.log('Prompt enviado:', chatHistory); 

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
 
  async clearHistory(): Promise<void> {
    try {
      this.bufferMemory = new BufferMemory({ returnMessages: true });
      console.log('Historial de conversación limpiado');
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      throw new Error('No se pudo limpiar el historial');
    }
  }
  
  async getHistory(): Promise<any[]> {
    try {
      const memVars = await this.bufferMemory.loadMemoryVariables({});
      return memVars.history || [];
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  }

  async getMemoryStatus(): Promise<{ messageCount: number; lastMessage?: string }> {
    try {
      const history = await this.getHistory();
      return {
        messageCount: history.length,
        lastMessage: history.length > 0 ? history[history.length - 1]?.content : undefined
      };
    } catch (error) {
      console.error('Error al verificar estado de memoria:', error);
      return { messageCount: 0 };
    }
  }
}