import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';
import { GetPromptsCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/getPromptsCodeUseCases';
import { UpdatePromptsCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/updatePromptsCodeUseCase';
import { AIAssistantDataBaseRepository } from '../../modules/AIAssistant/repository/AiAssistantDataBaseRepository';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;
    private readonly getPromptsUseCase: GetPromptsCodeUseCase;
    private readonly updatePromptsUseCase: UpdatePromptsCodeUseCase;

    constructor(repository: AIAssistantRepository, repositoryDB: AIAssistantDataBaseRepository) {
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repository);
        this.getPromptsUseCase = new GetPromptsCodeUseCase(repositoryDB);
        this.updatePromptsUseCase = new UpdatePromptsCodeUseCase(repositoryDB);
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

    async updatePrompts(_req: Request, res: Response): Promise<void> {
        const {
            analysis_tdd,
            refactoring
        } = _req.body;

        try {
            const updatePrompts = await this.updatePromptsUseCase.execute(
                {
                    analysis_tdd,
                    refactoring
                }
            );
            res.status(200).json(updatePrompts);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
}
