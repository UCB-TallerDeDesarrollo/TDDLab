import LlmController from '../../src/controllers/llmAI/llmController';
import { AnalyzeOrRefactorCodeUseCase } from '../../src/modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';
import { Request, Response } from 'express';
describe('LlmController', () => {
  const mockUseCase: jest.Mocked<AnalyzeOrRefactorCodeUseCase> = {
    execute: jest.fn()
  };
  const controller = new LlmController(mockUseCase);

  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('retorna error 400 si faltan datos', async () => {
    const req = { body: { instruction: {} } } as Request;
    const res = mockRes();

    await controller.handle(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos en el prompt' });
  });

  it('retorna resultado del use case', async () => {
    const req = { body: { instruction: { URL: 'https://github.com/ej', value: 'analizar' } } } as Request;
    const res = mockRes();
    mockUseCase.execute.mockResolvedValue('respuesta LLM');

    await controller.handle(req, res as Response);

    expect(mockUseCase.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ result: 'respuesta LLM' });
  });

  it('maneja errores del use case', async () => {
    const req = { body: { instruction: { URL: 'https://github.com/ej', value: 'refactorizar' } } } as Request;
    const res = mockRes();
    mockUseCase.execute.mockRejectedValue(new Error('Fallo LLM'));

    await controller.handle(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error procesando el prompt' });
  });
});
