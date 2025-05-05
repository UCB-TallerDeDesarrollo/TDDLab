import express from 'express';
import { AIAssistantRepository } from '../modules/AIAssistant/repository/AIAssistantRepositoy';
import AIAssistantController from '../controllers/AIAssistant/AIAssistantController';

const aiAssistantRepository = new AIAssistantRepository();
const aiAssistantController = new AIAssistantController(aiAssistantRepository);

const aiAssistantRouter = express.Router();

aiAssistantRouter.post(
    '/',
    async (req, res) => await aiAssistantController.analyzeOrRefactor(req, res)
);

export default aiAssistantRouter;
