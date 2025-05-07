import express from 'express';
import { AIAssistantRepository } from '../modules/AIAssistant/repository/AIAssistantRepositoy';
import AIAssistantController from '../controllers/AIAssistant/AIAssistantController';
import { AIAssistantDataBaseRepository } from '../modules/AIAssistant/repository/AiAssistantDataBaseRepository';

const aiAssistantRepository = new AIAssistantRepository();
const aiAssistantDBRepository = new AIAssistantDataBaseRepository();
const aiAssistantController = new AIAssistantController(aiAssistantRepository, aiAssistantDBRepository);

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

export default aiAssistantRouter;
