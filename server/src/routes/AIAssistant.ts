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

aiAssistantRouter.get(
  "/",
  async (req, res) => await aiAssistantController.getPrompts(req, res)
);

aiAssistantRouter.put(
  "/",
  async (req, res) => await aiAssistantController.updatePrompts(req, res)
);

aiAssistantRouter.post(
    '/chatbot',
    async (req, res) => await aiAssistantController.handleChat(req, res)
);


export default aiAssistantRouter;
