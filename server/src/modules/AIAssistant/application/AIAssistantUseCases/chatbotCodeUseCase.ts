import { ConversationService } from "../../repository/ChatbotMemoryRepository";

export class ChatbotCodeUseCase {
  private readonly convo: ConversationService;

  constructor() {
    this.convo = new ConversationService();
  }

  async execute(input: string): Promise<any> {
    try {
      // Validamos que el input no esté vacío
      if (!input || !input.trim()) {
        throw new Error("El mensaje no puede estar vacío");
      }

      console.log('Procesando mensaje:', input);
      
      // Verificamos el estado actual de la memoria para debugging
      const memoryStatus = await this.convo.getMemoryStatus();
      console.log('Estado de memoria:', memoryStatus);

      const response = await this.convo.sendMessage(input.trim());
      
      console.log('Respuesta generada:', response);
      
      return {
        success: true,
        response: response,
        memoryStatus: await this.convo.getMemoryStatus()
      };
    } catch (error) {
      console.error('Error en ChatbotCodeUseCase:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error en el caso de uso del chatbot",
        response: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo."
      };
    }
  }

  /**
   * Limpia el historial de conversación
   */
  async clearHistory(): Promise<void> {
    try {
      await this.convo.clearHistory();
      console.log('Historial limpiado desde UseCase');
    } catch (error) {
      console.error('Error al limpiar historial desde UseCase:', error);
      throw error;
    }
  }

  /**
   * Obtiene información sobre el estado actual
   */
  async getStatus(): Promise<any> {
    try {
      const memoryStatus = await this.convo.getMemoryStatus();
      return {
        isHealthy: true,
        memoryStatus
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}