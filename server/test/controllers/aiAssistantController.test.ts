import AIAssistantController from '../../src/controllers/AIAssistant/AIAssistantController';
import { Request, Response } from 'express';
import { AIAssistantRepository } from '../../src/modules/AIAssistant/repository/AIAssistantRepositoy';

describe('AIAssitantController', () => {
  let controller: AIAssistantController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockAiAssistantRepository: AIAssistantRepository;

  beforeEach(() => {
    mockAiAssistantRepository = {
      sendPrompt: jest.fn().mockResolvedValue({ result: 'Respuesta del Asistente' }),
    } as unknown as AIAssistantRepository;

    controller = new AIAssistantController(mockAiAssistantRepository);

    req = {
      body: {
        instruction: {
          URL: 'https://github.com/proyecto',
          value: 'analiza esto',
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('debería retornar resultado del LLM', async () => {
    await controller.analyzeOrRefactor(req as Request, res as Response);

    expect(mockAiAssistantRepository.sendPrompt).toHaveBeenCalledWith(req.body.instruction);
    expect(res?.json).toHaveBeenCalledWith({ result: 'Respuesta del Asistente' });
  });

  it('debería retornar error 400 si faltan datos', async () => {
    req.body.instruction = { URL: '', value: '' };

    await controller.analyzeOrRefactor(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(400);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Faltan datos en la instruccion' });
  });

  it('debería retornar error 500 si ocurre una excepción', async () => {
    (mockAiAssistantRepository.sendPrompt as jest.Mock).mockRejectedValueOnce(new Error('Error LLM'));

    await controller.analyzeOrRefactor(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(500);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Error procesando el prompt' });
  });
});
