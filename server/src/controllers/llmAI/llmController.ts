import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';

export default class LlmController {
    constructor(
        private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase
    ) { }

    async handle(req: Request, res: Response): Promise<void> {
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).json({ error: 'Falta el prompt' });
            return;
        }

        try {
            const result = await this.analyzeOrRefactorUseCase.execute(prompt);
            res.json({ result });
        } catch (err) {
            res.status(500).json({ error: 'Error procesando el prompt' });
        }
    }
}
