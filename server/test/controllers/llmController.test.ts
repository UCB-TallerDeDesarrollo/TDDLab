import LlmController from '../../src/controllers/llmAI/llmController';
import { AnalyzeOrRefactorCodeUseCase } from '../../src/modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';
import { Request, Response } from 'express';
describe('LlmController', () => {
  let controller: LlmController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockLLMService: LLMService;
  let useCase: AnalyzeOrRefactorCodeUseCase;

  beforeEach(() => {
    mockLLMService = {
      sendPrompt: jest.fn().mockResolvedValue('Respuesta del LLM'),
    };

    useCase = new AnalyzeOrRefactorCodeUseCase(mockLLMService);
    jest.spyOn(useCase, 'execute');
    controller = new LlmController(useCase);

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
    await controller.handle(req as Request, res as Response);

    expect(useCase.execute).toHaveBeenCalledWith(req.body.instruction);
    expect(res?.json).toHaveBeenCalledWith({ result: 'Respuesta del LLM' });
  });

  it('debería retornar error 400 si faltan datos', async () => {
    req.body.instruction = { URL: '', value: '' };

    await controller.handle(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(400);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Faltan datos en el prompt' });
  });

  it('debería retornar error 500 si ocurre una excepción', async () => {
    (useCase.execute as jest.Mock).mockRejectedValueOnce(new Error('Error LLM'));

    await controller.handle(req as Request, res as Response);

    expect(res?.status).toHaveBeenCalledWith(500);
    expect(res?.json).toHaveBeenCalledWith({ error: 'Error procesando el prompt' });
  });
});