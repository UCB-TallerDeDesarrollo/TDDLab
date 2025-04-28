import { LLMRepository } from '../../../../src/modules/LlmAi/repository/LLMRepositoy';
import { Instruction } from '../../../../src/modules/LlmAi/domain/LlmAI';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ result: 'Respuesta del modelo' }),
  })
) as jest.Mock;

describe('LLMRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LLM_API_URL = 'https://fake-api.com';
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    const repository = new LLMRepository();
    const instruction: Instruction = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'analiza este código',
    };

    const expectedPayload = {
      code: instruction.URL,
      instruction:
        'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?',
    };

    await repository.sendPrompt(instruction);

    expect(fetch).toHaveBeenCalledWith('https://fake-api.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expectedPayload),
    });
  });

  it('debería retornar mensaje de error si el fetch falla', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Falló el fetch');
    });

    const repository = new LLMRepository();
    const instruction: Instruction = {
      URL: 'algo',
      value: 'analiza',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Error al comunicarse con el modelo.');
  });
});
