import dotenv from 'dotenv';
import { AIAssistantAnswerObject, AIAssistantInstructionObject } from '../domain/AIAssistant';
import { AIAssistantDataBaseRepository } from './AiAssistantDataBaseRepository';
import { CommitDataObject } from '../domain/commitHistory';

dotenv.config();
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class AIAssistantRepository {
    private readonly apiKey = process.env.TOGETHER_API_KEY;
    private readonly apiUrl = process.env.LLM_API_URL || '';
    private readonly aiAssistantDB = new AIAssistantDataBaseRepository;

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibio ninguna respuesta del modelo.' };
        }

        if (data.error) {
            return { result: `Error del modelo: ${data.error}` };
        }

        return { result: data };
    }

    private async getCommitHistoryUrl(URL: string): Promise<string> {
        try {
            const match = URL.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match || match.length < 3) {
                throw new Error('URL del repositorio inválida');
            }

            const owner = match[1];
            const repoName = match[2];

            return `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/commit-history.json`;
        } catch (error) {
            console.error('Error construyendo la URL de commit history:', error);
            throw error;
        }
    }

    private serializeCommits(commits: CommitDataObject[]): any[] {
        return commits.map(commit => ({
            ...commit,
            commit: {
                ...commit.commit,
                date: commit.commit.date.toISOString(),
            }
        }));
    }

    private async getCommitHistory(URL: string): Promise<CommitDataObject[]> {
        try {
            const fullUrl = await this.getCommitHistoryUrl(URL);
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const commitHistory = await response.json();

            const commits: CommitDataObject[] = commitHistory.map((commitData: any) => ({
                sha: commitData.sha,
                author: commitData.author,
                commit: {
                    date: new Date(commitData.commit.date),
                    message: commitData.commit.message,
                    url: commitData.commit.url
                },
                stats: {
                    total: commitData.stats.total,
                    additions: commitData.stats.additions,
                    deletions: commitData.stats.deletions,
                    date: commitData.stats.date
                },
                coverage: commitData.coverage,
                test_count: commitData.test_count,
                failed_tests: commitData.failed_tests,
                conclusion: commitData.conclusion
            }));

            commits.sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime());

            return commits;
        } catch (error) {
            console.error("Error obteniendo commits desde el archivo JSON:", error);
            throw error;
        }
    }

    private async getContextFromCommitHistory(URL: string): Promise<string> {
        try {
            const commits = await this.getCommitHistory(URL);

            if (!commits || commits.length === 0) {
                console.warn("No se encontraron commits. Usando la URL como contexto.");
                return URL;
            }

            const serializableCommits = this.serializeCommits(commits);
            return JSON.stringify(serializableCommits, null, 2);

        } catch (error) {
            console.warn("Error al obtener commits. Usando la URL como contexto:", error);
            return URL;
        }
    }

    private async buildPromt(instructionValue: string): Promise<string> {
        const prompts = await this.aiAssistantDB.getPrompts();
        if (instructionValue.includes('analiza')) return prompts?.tdd_analysis || 'Prompt no disponible para la evaluación de la aplicación de TDD.';
        if (instructionValue.includes('refactoriza')) return prompts?.refactoring || 'Prompt no disponible para la evaluación de la aplicación de refactoring.';
        if (instructionValue.includes('califica')) return prompts?.evaluation || 'Prompt no disponible para la calificacion de TDD.';
        return 'interpreta el siguiente código';
    }

    public buildPromptByTestExecuted(tddlog: any, promptInstructions: string): string {
        const tddlogString = JSON.stringify(tddlog, null, 2);

        return `
                  ${promptInstructions}
                  ${tddlogString}`;
    }

    private async sendRequestToAIAssistant(code: string, instruction: string): Promise<string> {
        try {
            const userContent = `${instruction}\n\n${code}`;

            if (!this.apiUrl) {
                throw new Error('LLM_API_URL no está definido');
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: 'Eres un experto en desarrollo de software, responde todo en español latino.' },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.2,
                    max_tokens: 1024
                }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data?.choices?.[0]?.message?.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendPrompt(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        try {
            const newInstruction = await this.buildPromt(instruction.value);
            const instructionValue = instruction.value.toLowerCase();
            let context: string;

            if (instructionValue === "analiza" || instructionValue === "califica") {
                context = await this.getContextFromCommitHistory(instruction.URL);
            } else context = instruction.URL;

            const raw = await this.sendRequestToAIAssistant(context, newInstruction);
            return this.mapToAIAssistantAnswer(raw);
        } catch (error) {
            console.error('[sendPrompt ERROR]', error);
            return { result: 'Error al comunicarse con el modelo.' };
        }
    }

    public async sendTDDExtensionPrompt(tddlog: any, promptInstructions: string): Promise<AIAssistantAnswerObject> {
        const prompt = this.buildPromptByTestExecuted(tddlog, promptInstructions);
        const raw = await this.sendRequestToAIAssistant(prompt, '');
        return this.mapToAIAssistantAnswer(raw);
    }

    public async sendChat(chatHistory: string, input: string): Promise<AIAssistantAnswerObject> {
        const raw = await this.sendRequestToAIAssistant(chatHistory, input);
        return this.mapToAIAssistantAnswer(raw);
    }
}