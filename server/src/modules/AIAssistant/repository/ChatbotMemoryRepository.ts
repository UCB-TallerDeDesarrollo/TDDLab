import { BufferMemory } from "langchain/memory";
import { AIAssistantRepository } from "../repository/AIAssistantRepositoy";

export class ConversationService {
  private memory = new BufferMemory({ returnMessages: true });
  private repo = new AIAssistantRepository();

  async sendMessage(userInput: string): Promise<string> {
    try {
      const memVars = await this.memory.loadMemoryVariables({});
            let historyText = "";
      if (memVars.history && Array.isArray(memVars.history)) {
        historyText = memVars.history
          .map((msg: any) => {
            const role = msg.constructor.name === 'HumanMessage' || msg._getType() === 'human' ? 'Usuario' : 'Asistente';
            return `${role}: ${msg.content}`;
          })
          .join('\n');
      }

      let fullPrompt: string;
      if (historyText) {
        fullPrompt = `Conversación anterior:
${historyText}

Usuario: ${userInput}
Asistente:`;
      } else {
        fullPrompt = `Usuario: ${userInput}
Asistente:`;
      }

      console.log('Prompt enviado:', fullPrompt); 

      const answerObj = await this.repo.sendChatWithHistory(fullPrompt);
      
      let response: string;
      if (typeof answerObj === 'string') {
        response = answerObj;
      } else if (answerObj && typeof answerObj.result === 'string') {
        response = answerObj.result;
      } else {
        console.error('Formato de respuesta inesperado:', answerObj);
        throw new Error('Formato de respuesta inválido del repositorio');
      }

      if (!response || !response.trim()) {
        throw new Error('Respuesta vacía del repositorio');
      }

      await this.memory.saveContext(
        { input: userInput },
        { output: response }
      );

      return response.trim();
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
      this.memory = new BufferMemory({ returnMessages: true });
      console.log('Historial de conversación limpiado');
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      throw new Error('No se pudo limpiar el historial');
    }
  }

  
  async getHistory(): Promise<any[]> {
    try {
      const memVars = await this.memory.loadMemoryVariables({});
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