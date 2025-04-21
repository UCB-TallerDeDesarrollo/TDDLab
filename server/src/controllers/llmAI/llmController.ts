import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';
import { Instruction } from '../../modules/LlmAi/domain/LlmAI';

export default class LlmController {
    constructor(
        private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase
    ) { }

    async handle(req: Request, res: Response): Promise<void> {
        const instruction: Instruction = req.body.instruction;

        if (!instruction?.URL || !instruction?.value) {
            res.status(400).json({ error: 'Faltan datos en el prompt' });
            return;
        }

        try {
            const result = await this.analyzeOrRefactorUseCase.execute(instruction);
            res.json({ result });
        } catch (err) {
            res.status(500).json({ error: 'Error procesando el prompt' });
        }
    }
}
