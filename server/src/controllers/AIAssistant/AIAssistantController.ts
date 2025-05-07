import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';
import { GetPromptsCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/getPromptsCodeUseCases';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;
    private readonly getPromptsUseCase: GetPromptsCodeUseCase;

    constructor(repository: AIAssistantRepository) {
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repository);
        this.getPromptsUseCase = new GetPromptsCodeUseCase(repository);
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
}
