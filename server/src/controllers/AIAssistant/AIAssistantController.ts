import { Request, Response } from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantRepository } from '../../modules/AIAssistant/repository/AIAssistantRepositoy';

export default class AIAssistantController {

    private readonly analyzeOrRefactorUseCase: AnalyzeOrRefactorCodeUseCase;
    private readonly repository: AIAssistantRepository;


    constructor(repository: AIAssistantRepository) {
        this.repository = repository; // Inicializas el repositorio
        this.analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(repository);
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

    async handleChat(req: Request, res: Response): Promise<void> {
        const userInput = req.body.input;

        if (!userInput) {
            res.status(400).json({ error: 'Faltan datos en la solicitud' });
            return;
        }

        try {
            console.log(userInput); 
            // Usamos el método sendChat del repositorio
            const response = await this.repository.sendChat(userInput);
            res.json({ response });
        } catch (err) {
            res.status(500).json({ error: 'Error procesando la solicitud del chatbot' });
        }
    }

}


