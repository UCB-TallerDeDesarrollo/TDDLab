import { LLMService } from '../repositories/LLMService';

export class MockLLMService implements LLMService {
    async sendPrompt(prompt: string): Promise<string> {
        if (prompt.toLowerCase().includes('analiza')) {
            return '🔍 Análisis: Se detectan buenas prácticas, pero falta cohesión entre módulos.';
        } else if (prompt.toLowerCase().includes('refactoriza')) {
            return '🛠 Refactorización: Separar responsabilidades, aplicar principios SOLID.';
        } else {
            return '🤖 Instrucción no reconocida.';
        }
    }
}
