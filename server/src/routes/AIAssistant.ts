import express from 'express';
import { AnalyzeOrRefactorCodeUseCase } from '../modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { aiAssistantRepository } from '../modules/AIAssistant/repository/AIAssistantRepositoy';
import AIAssistantController from '../controllers/AIAssistant/AIAssistantController';

// Instanciar la implementación del servicio (mock o real)
const llmRepository = new aiAssistantRepository();

// Instanciar el caso de uso con su dependencia
const analyzeOrRefactorUseCase = new AnalyzeOrRefactorCodeUseCase(llmRepository);

// Instanciar el controlador
const llmController = new AIAssistantController(analyzeOrRefactorUseCase);

// Crear router
const aiAssistantRouter = express.Router();

// Definir ruta POST
aiAssistantRouter.post(
    '/',
    async (req, res) => await llmController.analyzeOrRefactor(req, res)
);

export default aiAssistantRouter;
