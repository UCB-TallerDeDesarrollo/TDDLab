// src/routes/chatbotRoutes.ts
import express from "express";
import ChatbotController from "../controllers/Chatbot/ChatbotController"; // Importación por defecto

const chatbotRouter = express.Router();

// Usamos el controlador importado
chatbotRouter.use("/", ChatbotController);

export default chatbotRouter;
