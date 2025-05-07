import { AIAssistantRepository } from '../../../../src/modules/AIAssistant/repository/AIAssistantRepositoy';
import { AIAssistantInstructionObject } from '../../../../src/modules/AIAssistant/domain/AIAssistant';
import axios from 'axios';

jest.mock('axios');


describe('AIAssistantRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOGETHER_API_KEY = 'apíkey';
    process.env.LLM_API_URL = 'https://fake-api.com';
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'Respuesta del modelo' } }],
      },
    });

    const repository = new AIAssistantRepository();

    jest.spyOn(repository, 'getPrompts').mockResolvedValue({
      analysis_tdd: 'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?',
      refactoring: 'irrelevante',
    });

    const instruction: AIAssistantInstructionObject = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'analiza este código',
    };

    const expectedPayload = {
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: 'system', content: 'Eres un experto en desarrollo de software.' },
        {
          role: 'user',
          content:
            'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?\n\nhttps://github.com/ejemplo/proyecto',
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    };

    const result = await repository.sendPrompt(instruction);

    expect(mockedAxios.post).toHaveBeenCalledWith('https://fake-api.com', expectedPayload, {
      headers: {
        Authorization: `Bearer apíkey`,
        'Content-Type': 'application/json',
      },
    });

    expect(result).toEqual({ result: 'Respuesta del modelo' });
  });

  it('debería retornar mensaje de error si el fetch falla', async () => {
    const repository = new AIAssistantRepository();

    jest.spyOn(repository, 'getPrompts').mockResolvedValue({
      analysis_tdd: 'fake prompt',
      refactoring: 'fake prompt',
    });

    jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Falló el fetch'));

    const instruction: AIAssistantInstructionObject = {
      URL: 'algo',
      value: 'analiza',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toEqual({
      result: 'Error al comunicarse con el modelo.',
    });
  });
});