// src/controllers/Chatbot/ChatbotController.ts
import express, { Request, Response } from 'express';
import { ChatbotUseCases } from '../../modules/Chatbot/domain/ChatbotUseCases';  // Asegúrate de que la ruta esté correcta

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El prompt no puede estar vacío.' });
    }

    // Usamos ChatbotUseCases para procesar el prompt (simulado con mock)
    const response = await ChatbotUseCases.processPrompt(prompt);
    return res.json({ response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al procesar la solicitud del chatbot' });
  }
});

export default router;
