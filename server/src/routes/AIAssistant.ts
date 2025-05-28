import express from 'express';
import { AIAssistantRepository } from '../modules/AIAssistant/repository/AIAssistantRepositoy';
import AIAssistantController from '../controllers/AIAssistant/AIAssistantController';
import { AIAssistantDataBaseRepository } from '../modules/AIAssistant/repository/AiAssistantDataBaseRepository';
import { ChatbotAssistantRepository } from '../modules/AIAssistant/repository/ChatbotAssistantRepository';

const aiAssistantRepository = new AIAssistantRepository();
const aiAssistantDBRepository = new AIAssistantDataBaseRepository();
const chatbotAssistantRepository = new ChatbotAssistantRepository();
const aiAssistantController = new AIAssistantController(aiAssistantRepository, aiAssistantDBRepository, chatbotAssistantRepository);

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
    '/analyze-tdd-extension',
    async (req, res) => await aiAssistantController.analyzeTDDFromExtension(req, res)
);

aiAssistantRouter.post(
    '/chatbot',
    async (req, res) => await aiAssistantController.chatBot(req, res)
);


export default aiAssistantRouter;
