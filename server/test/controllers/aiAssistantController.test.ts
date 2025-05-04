import LlmController from '../../src/controllers/AIAssistant/AIAssistantController';
import { Request, Response } from 'express';
import { AIAssistantRepository } from '../../src/modules/AIAssistant/repository/AIAssistantRepositoy';

describe('LlmController', () => {
  let controller: LlmController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockLLMRepo: AIAssistantRepository;

  beforeEach(() => {
    mockLLMRepo = {
      sendPrompt: jest.fn().mockResolvedValue({ result: 'Respuesta del LLM' }),
    } as unknown as AIAssistantRepository;

    controller = new LlmController(mockLLMRepo);

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

    expect(mockLLMRepo.sendPrompt).toHaveBeenCalledWith(req.body.instruction);
    expect(res?.json).toHaveBeenCalledWith({ result: 'Respuesta del LLM' });
  });

  it('debería retornar error 400 si faltan datos', async () => {
    req.body.instruction = { URL: '', value: '' };

    await controller.analyzeOrRefactor(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(400);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Faltan datos en el prompt' });
  });

  it('debería retornar error 500 si ocurre una excepción', async () => {
    (mockLLMRepo.sendPrompt as jest.Mock).mockRejectedValueOnce(new Error('Error LLM'));

    await controller.analyzeOrRefactor(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(500);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Error procesando el prompt' });
  });
});
