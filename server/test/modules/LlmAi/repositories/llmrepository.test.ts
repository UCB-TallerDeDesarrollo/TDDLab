import { LLMRepository } from '../../../../src/modules/LlmAi/repository/LLMRepositoy';
import { Instruction } from '../../../../src/modules/LlmAi/domain/LlmAI';
import axios from 'axios';

jest.mock('axios'); // Simula axios

describe('LLMRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOGETHER_API_KEY = 'apíkey'; // Configura correctamente la clave
    process.env.LLM_API_URL = 'https://fake-api.com';
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'Respuesta del modelo' } }],
      },
    });

    const repository = new LLMRepository();
    const instruction: Instruction = {
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

    await repository.sendPrompt(instruction);

    expect(mockedAxios.post).toHaveBeenCalledWith('https://fake-api.com', expectedPayload, {
      headers: {
        Authorization: `Bearer apíkey`,
        'Content-Type': 'application/json',
      },
    });
  });

  it('debería retornar mensaje de error si el fetch falla', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockRejectedValueOnce(new Error('Falló el fetch'));

    const repository = new LLMRepository();
    const instruction: Instruction = {
      URL: 'algo',
      value: 'analiza',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Error al comunicarse con el modelo.');
  });
});
