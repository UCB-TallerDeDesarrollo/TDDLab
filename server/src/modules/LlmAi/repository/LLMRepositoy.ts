import { LLMService, Instruction } from '../domain/LlmAI';
import dotenv from 'dotenv';

dotenv.config();

export class LLMRepository implements LLMService {
    private readonly apiUrl = process.env.LLM_API_URL!;

    private buildInstruction(instructionValue: string): string {
        const lower = instructionValue.toLowerCase();
        if (lower.includes('analiza')) return `Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?`;
        if (lower.includes('refactoriza')) return `Evalúa este repositorio y sugiere mejoras usando principios de ingeniería de IA: claridad en las instrucciones, eficiencia en el contexto, uso adecuado de modelos, estructura del código y facilidad de mantenimiento`;
        return 'interpreta el siguiente código';
    }

    private async executePostRequest(code: string, instruction: string): Promise<string> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, instruction }),
            });

            const data = await response.json();
            return data.result || 'No se recibió respuesta del modelo.';
        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendPrompt(instruction: Instruction): Promise<string> {
        const newInstruction = this.buildInstruction(instruction.value);
        return await this.executePostRequest(instruction.URL, newInstruction);
    }
}
