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
    try {
      // 1) Cargamos el historial (mensajes anteriores)
      const memVars = await this.memory.loadMemoryVariables({});
      
      // 2) Construimos el historial como string limpio
      let historyText = "";
      if (memVars.history && Array.isArray(memVars.history)) {
        historyText = memVars.history
          .map((msg: any) => {
            // Verificamos el tipo de mensaje correctamente
            const role = msg.constructor.name === 'HumanMessage' || msg._getType() === 'human' ? 'Usuario' : 'Asistente';
            return `${role}: ${msg.content}`;
          })
          .join('\n');
      }

      // 3) Creamos el prompt más limpio y estructurado
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

      console.log('Prompt enviado:', fullPrompt); // Para debug

      // 4) Llamamos al método del repositorio
      const answerObj = await this.repo.sendChatWithHistory(fullPrompt);
      
      // Extraemos la respuesta del objeto
      let response: string;
      if (typeof answerObj === 'string') {
        response = answerObj;
      } else if (answerObj && typeof answerObj.result === 'string') {
        response = answerObj.result;
      } else {
        console.error('Formato de respuesta inesperado:', answerObj);
        throw new Error('Formato de respuesta inválido del repositorio');
      }

      // Verificamos que la respuesta sea válida
      if (!response || !response.trim()) {
        throw new Error('Respuesta vacía del repositorio');
      }

      // 5) Guardamos en memoria el intercambio
      await this.memory.saveContext(
        { input: userInput },
        { output: response }
      );

      return response.trim();
    } catch (error) {
      console.error('[ConversationService Error]', error);
      
      // Proporcionamos más información sobre el error
      if (error instanceof Error) {
        throw new Error(`Error al procesar la conversación: ${error.message}`);
      } else {
        throw new Error("Error desconocido al procesar la conversación");
      }
    }
  }

  /**
   * Limpia el historial de conversación
   */
  async clearHistory(): Promise<void> {
    try {
      this.memory = new BufferMemory({ returnMessages: true });
      console.log('Historial de conversación limpiado');
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      throw new Error('No se pudo limpiar el historial');
    }
  }

  /**
   * Obtiene el historial actual para debugging
   */
  async getHistory(): Promise<any[]> {
    try {
      const memVars = await this.memory.loadMemoryVariables({});
      return memVars.history || [];
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  }

  /**
   * Verifica el estado de la memoria
   */
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