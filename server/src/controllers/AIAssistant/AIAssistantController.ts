import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';
import { AnalyzeTDDUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeTDDUseCase';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;
    private readonly analyzeTDDUseCase: AnalyzeTDDUseCase;

    constructor(repository: AIAssistantRepository) {
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repository);
        this.analyzeTDDUseCase = new AnalyzeTDDUseCase(repository);
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

    async analyzeTDDFromExtension(req: Request, res: Response): Promise<void> {
        const { tddlog, gitInfo } = req.body;

        if (!tddlog || !gitInfo) {
            res.status(400).json({ error: 'tddlog and gitInfo are required in the JSON body.' });
            return;
        }

        try {
            const result = await this.analyzeTDDUseCase.execute(tddlog, gitInfo);
            res.json({ generatedText: result });
        } catch (error) {
            console.error("Error generating text:", error);
            res.status(500).json({ error: "Failed to generate text." });
        }
    }
}
