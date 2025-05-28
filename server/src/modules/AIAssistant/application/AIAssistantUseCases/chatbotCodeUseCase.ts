import { ChatbotAssistantRepository } from "../../repository/ChatbotAssistantRepository";

export class ChatbotCodeUseCase {
  private readonly adapter: ChatbotAssistantRepository;

  constructor(adapter: ChatbotAssistantRepository) {
    this.adapter = adapter;
  }

  async execute(input: string): Promise<any> {
    try {
      if (!input || !input.trim()) {
        throw new Error("El mensaje no puede estar vacío");
      }

      console.log('Procesando mensaje:', input);
      
      const memoryStatus = await this.adapter.getMemoryStatus();
      console.log('Estado de memoria:', memoryStatus);

      const response = await this.adapter.sendMessage(input.trim());
      
      console.log('Respuesta generada:', response);
      
      return {
        success: true,
        response: response,
        memoryStatus: await this.adapter.getMemoryStatus()
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
  
  /// Estos metodos se usan??
  async clearHistory(): Promise<void> {
    try {
      await this.adapter.clearHistory();
      console.log('Historial limpiado desde UseCase');
    } catch (error) {
      console.error('Error al limpiar historial desde UseCase:', error);
      throw error;
    }
  }

  
  async getStatus(): Promise<any> {
    try {
      const memoryStatus = await this.adapter.getMemoryStatus();
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