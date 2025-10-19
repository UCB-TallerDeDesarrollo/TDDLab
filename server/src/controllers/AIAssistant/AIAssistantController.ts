import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';
import { GetPromptsCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/getPromptsCodeUseCases';
import { UpdatePromptsCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/updatePromptsCodeUseCase';
import { AIAssistantDataBaseRepository } from '../../modules/AIAssistant/repository/AiAssistantDataBaseRepository';
import { AnalyzeTDDCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeTDDCodeUseCase';
import { ChatbotCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/chatbotCodeUseCase';
import { ChatbotAssistantRepository } from '../../modules/AIAssistant/repository/ChatbotAssistantRepository';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;
    private readonly getPromptsUseCase: GetPromptsCodeUseCase;
    private readonly updatePromptsUseCase: UpdatePromptsCodeUseCase;
    private readonly analyzeTDDUseCase: AnalyzeTDDCodeUseCase;
    private readonly chatbotUseCase: ChatbotCodeUseCase;

    constructor(
        repository: AIAssistantRepository,
        repositoryDB: AIAssistantDataBaseRepository,
        repositoryChatBot: ChatbotAssistantRepository
    ) {
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repositoryChatBot);
        this.getPromptsUseCase = new GetPromptsCodeUseCase(repositoryDB);
        this.updatePromptsUseCase = new UpdatePromptsCodeUseCase(repositoryDB);
        this.analyzeTDDUseCase = new AnalyzeTDDCodeUseCase(repository);
        this.chatbotUseCase = new ChatbotCodeUseCase(repositoryChatBot);
    }

    async analyzeOrRefactor(req: Request, res: Response): Promise<void> {
        const instruction = req.body.instruction;

        if (!instruction?.URL || !instruction?.value) {
            res.status(400).json({ error: 'Faltan datos en la instruccion' });
            return;
        }

        try {
            const result = await this.analyzeOrRefactorUseCase.execute(instruction);
            res.json(result);
        } catch (err) {
            console.error('[CONTROLLER ERROR] analyzeOrRefactor:', err);
            res.status(500).json({ error: 'Error procesando el prompt' });
        }
    }

    async getPrompts(_req: Request, res: Response): Promise<void> {
        try {
            const prompts = await this.getPromptsUseCase.execute();
            res.status(200).json(prompts);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }

    async updatePrompts(_req: Request, res: Response): Promise<void> {
        try {
            const prompts = _req.body;

            const updatedPrompts = await this.updatePromptsUseCase.execute(prompts);

            res.status(200).json(updatedPrompts);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }


    async analyzeTDDFromExtension(req: Request, res: Response): Promise<void> {
        const { tddlog, prompt } = req.body;

        if (!tddlog || !prompt) {
            res.status(400).json({
                error: 'Se requieren tddlog y prompt en el cuerpo de la solicitud',
                details: {
                    received: {
                        tddlog: tddlog !== undefined,
                        prompt: prompt !== undefined
                    }
                }
            });
            return;
        }

        try {
            const result = await this.analyzeTDDUseCase.execute(tddlog, prompt);
            res.json({
                success: true,
                analysis: result
            });
        } catch (error: unknown) {
            console.error('[CONTROLLER ERROR] analyzeTDDFromExtension:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al analizar el código';
            res.status(500).json({
                error: "Error al analizar el código",
                details: errorMessage
            });
        }
    }

    async chatBot(req: Request, res: Response): Promise<void> {
        const userInput = req.body.input;

        if (!userInput) {
            res.status(400).json({ error: 'Faltan datos en la solicitud' });
            return;
        }

        try {
            const response = await this.chatbotUseCase.execute(userInput);
            res.json(response);
        } catch (err) {
            res.status(500).json({ error: 'Error procesando la solicitud del chatbot' });
        }
    }

}


