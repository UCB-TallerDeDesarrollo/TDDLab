import dotenv from 'dotenv';
import { AIAssistantAnswerObject, AIAssistantInstructionObject } from '../domain/AIAssistant';

dotenv.config();

export class AIAssistantRepository {
    private readonly apiUrl = process.env.LLM_API_URL!;
    

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibio ninguna respuesta del modelo.' };
        }
    
        if (data.error) {
            return { result: `Error del modelo: ${data.error}` };
        }
    
        if (!data.result) {
            return { result: 'La respuesta del modelo no fue valida o no contenia informacion' };
        }
    
        return { result: data.result };
    }
    

    private buildPromt(instructionValue: string): string {
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

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendPrompt(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        const newInstruction = this.buildPromt(instruction.value);
        const raw = await this.executePostRequest(instruction.URL, newInstruction);
        return this.mapToAIAssistantAnswer(raw);
    }

    public async sendChat(input: string): Promise<AIAssistantAnswerObject> {
        const code = "Responde como un chatbot";  // Definimos un código apropiado para que el modelo actúe como un chatbot.
        const instruction = input;  // El input del usuario es la instrucción que el modelo usará
    
        // Aquí, 'executePostRequest' se mantiene sin cambios
        const raw = await this.executePostRequest(code, instruction);
    
        // Mapeamos la respuesta y la devolvemos
        return this.mapToAIAssistantAnswer(raw);
    }
    

    
}
