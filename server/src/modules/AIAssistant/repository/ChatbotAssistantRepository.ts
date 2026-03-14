import { BufferMemory } from "langchain/memory";
import { AIAssistantRepository } from "./AIAssistantRepositoy";
import { AIAssistantAnswerObject, AIAssistantInstructionObject } from "../domain/AIAssistant";
import { CommitDataObject } from "../domain/commitHistory";
import { AIAssistantDataBaseRepository } from "./AiAssistantDataBaseRepository";

export class ChatbotAssistantRepository {
    private readonly bufferMemory = new BufferMemory({ returnMessages: true });
    private readonly aiAssistantRepository = new AIAssistantRepository;
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

    private async buildConversationContext(userInput: string): Promise<{ prompt: string }> {
        const memoryVars = await this.bufferMemory.loadMemoryVariables({});
        let historyText = "";

        if (memoryVars.history && Array.isArray(memoryVars.history)) {
            historyText = memoryVars.history
                .map((msg: any) => {
                    const role = msg.constructor.name === 'HumanMessage' || msg._getType() === 'human' ? 'Usuario' : 'Asistente';
                    return `${role}: ${msg.content}`;
                }).join('\n');
        }

        const prompt = historyText
            ? `Conversación anterior:\n${historyText}\n\nUsuario: ${userInput}\nAsistente:`
            : `Usuario: ${userInput}\nAsistente:`;

        return { prompt };
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

    private async getTddLogUrl(URL: string): Promise<string> {
        try {
            const match = URL.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match || match.length < 3) {
                throw new Error('URL del repositorio inválida');
            }
            const owner = match[1];
            const repoName = match[2];
            return `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/tdd_log.json`;
        } catch (error) {
            console.error('Error construyendo la URL de tdd_log.json:', error);
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

    private async getTddLog(URL: string): Promise<any[] | null> {
        try {
            const fullUrl = await this.getTddLogUrl(URL);
            const response = await fetch(fullUrl);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`tdd_log.json no encontrado en ${fullUrl}. Continuando sin él.`);
                    return null;
                }
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const tddLog = await response.json();
            return tddLog;

        } catch (error) {
            console.warn("Error obteniendo tdd_log.json:", error);
            return null; 
        }
    }

    //Antes llamado: getContextFromCommitHistory
    private async buildAnalysisContext(URL: string): Promise<string> {
        try {
            const commits = await this.getCommitHistory(URL);

            if (!commits || commits.length === 0) {
                console.warn("No se encontraron commits. Usando la URL como contexto.");
                return URL;
            }

            const serializableCommits = this.serializeCommits(commits);
            const tddLog = await this.getTddLog(URL);
            const combinedContext = {
                commitHistory: serializableCommits,
                tddLog: tddLog 
            };

            return JSON.stringify(combinedContext, null, 2);

        } catch (error) {
            console.warn("Error al construir el contexto de análisis. Usando la URL como contexto:", error);
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

    async sendMessage(userInput: string): Promise<AIAssistantAnswerObject> {
        try {
            const { prompt } = await this.buildConversationContext(userInput);

            const answerLLM = await this.aiAssistantRepository.sendChat(prompt, userInput);

            await this.bufferMemory.saveContext(
                { input: userInput },
                { output: answerLLM.result }
            );

            return answerLLM;
        } catch (error) {
            console.error('[ConversationService Error]', error);
            throw new Error("Error al procesar la conversación");
        }
    }


    public async sendPrompt(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        try {
            const newInstruction = await this.buildPromt(instruction.value);
            const instructionValue = instruction.value.toLowerCase();
            let context: string;

            if (instructionValue === "analiza" || instructionValue === "califica") {
                context = await this.buildAnalysisContext(instruction.URL);
            } else {
                context = instruction.URL;
            }

            const fullInput = `${newInstruction}\n\nContexto:\n${context}`;
            const { prompt } = await this.buildConversationContext(fullInput);

            const raw = await this.aiAssistantRepository.sendRequestToAIAssistant(prompt, newInstruction);

            await this.bufferMemory.saveContext(
                { input: newInstruction },
                { output: raw }
            );

            return this.mapToAIAssistantAnswer(raw);
        } catch (error) {
            console.error('[sendPrompt ERROR]', error);
            return { result: 'Error al comunicarse con el modelo.' };
        }
    }
}