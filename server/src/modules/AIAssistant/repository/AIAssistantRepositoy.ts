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

    public buildPromptByTestExecuted(tddlog: any, promptInstructions: string): string {
        const tddlogString = JSON.stringify(tddlog, null, 2);
        
        return `<|system|>
                Eres un experto en TDD y análisis de código. Analiza el siguiente archivo según las instrucciones proporcionadas.
                </s>
                <|user|>
                ${promptInstructions}
                
                Este es el archivo a analizar:
                ${tddlogString}
                </s>
                <|assistant|>`;
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
}
