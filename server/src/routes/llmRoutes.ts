import express from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';
import LlmController from '../controllers/llmAI/llmController';
import { LLMRepository } from '../modules/LlmAi/repository/LLMRepositoy';

// Instanciar la implementación del servicio (mock o real)
const llmRepository = new LLMRepository();

// Instanciar el caso de uso con su dependencia
const analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(llmRepository);

// Instanciar el controlador
const llmController = new LlmController(analyzeOrRefactorUseCase);

// Crear router
const llmRouter = express.Router();

// Definir ruta POST
llmRouter.post(
    '/',
    async (req, res) => await llmController.handle(req, res)
);

export default llmRouter;
