import { AIAssistantInstructionObject } from '../../../../src/modules/AIAssistant/domain/AIAssistant';
import { ChatbotAssistantRepository } from '../../../../src/modules/AIAssistant/repository/ChatbotAssistantRepository';

jest.mock('axios');


describe('AIAssistantRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOGETHER_API_KEY = 'apíkey';
    process.env.LLM_API_URL = 'https://fake-api.com';
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'Respuesta del modelo' } }],
        }),
    });
    global.fetch = mockFetch as any;

    const repository = new ChatbotAssistantRepository();

    jest.spyOn(repository['aiAssistantDB'], 'getPrompts').mockResolvedValue({
      analysis_tdd: 'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?',
      refactoring: 'irrelevante',
    });

    const instruction: AIAssistantInstructionObject = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'analiza este código',
    };

    const result = await repository.sendPrompt(instruction);

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({ result: 'Respuesta del modelo' });
  });

  it('debería retornar mensaje de error si el fetch falla', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Falló el fetch'));
    global.fetch = mockFetch as any;

    const repository = new ChatbotAssistantRepository();

    jest.spyOn(repository['aiAssistantDB'], 'getPrompts').mockResolvedValue({
      analysis_tdd: 'fake prompt',
      refactoring: 'fake prompt',
    });

    const instruction: AIAssistantInstructionObject = {
      URL: 'algo',
      value: 'analiza',
    };

    const result = await repository.sendPrompt(instruction);

    expect(result).toEqual({ result: 'Error al comunicarse con el modelo.' });
  });
});