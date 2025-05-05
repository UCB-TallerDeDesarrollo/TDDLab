import { AIAssistantRepository } from '../../../../src/modules/AIAssistant/repository/AIAssistantRepositoy';
import { AIAssistantInstructionObject } from '../../../../src/modules/AIAssistant/domain/AIAssistant';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ result: 'Respuesta del modelo' }),
  })
) as jest.Mock;

describe('AIAssistantRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LLM_API_URL = 'https://fake-api.com';
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    const repository = new AIAssistantRepository();

    const instruction: AIAssistantInstructionObject = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'analiza este código',
    };

    const expectedPayload = {
      code: instruction.URL,
      instruction:
        'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?',
    };

    const result = await repository.sendPrompt(instruction);

    expect(fetch).toHaveBeenCalledWith('https://fake-api.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expectedPayload),
    });

    expect(result).toEqual({ result: 'La respuesta del modelo no fue valida o no contenia informacion' });
  });

  it('debería retornar mensaje de error si el fetch falla', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Falló el fetch');
    });

    const repository = new AIAssistantRepository();
    const instruction: AIAssistantInstructionObject = {
      URL: 'algo',
      value: 'analiza',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toEqual({ result: 'La respuesta del modelo no fue valida o no contenia informacion' });
  });
});
