import express from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { LLMRepository } from '../modules/AIAssistant/repository/AIAssistantRepositoy';
import AIAssistantController from '../controllers/AIAssistant/AIAssistantController';

// Instanciar la implementación del servicio (mock o real)
const llmRepository = new LLMRepository();

// Instanciar el caso de uso con su dependencia
const analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(llmRepository);

// Instanciar el controlador
const llmController = new AIAssistantController(analyzeOrRefactorUseCase);

// Crear router
const llmRouter = express.Router();

// Definir ruta POST
llmRouter.post(
    '/',
    async (req, res) => await llmController.handle(req, res)
);

export default llmRouter;
