import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;

    constructor(repository: AIAssistantRepository) {
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repository);
    }

    async analyzeOrRefactor(req: Request, res: Response): Promise<void> {
        const instruction = req.body.instruction;

        if (!instruction?.URL || !instruction?.value) {
            res.status(400).json({ error: 'Faltan datos en el prompt' });
            return;
        }

        try {
            const result = await this.analyzeOrRefactorUseCase.execute(instruction);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: 'Error procesando el prompt' });
        }
    }
}
