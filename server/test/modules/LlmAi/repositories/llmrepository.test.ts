import { LLMRepository } from '../../../../src/modules/LlmAi/repository/LLMRepositoy';
import { Instruction } from '../../../../src/modules/LlmAi/domain/LlmAI';

// Mock global fetch
global.fetch = jest.fn();

describe('LLMRepository', () => {
  let repository: LLMRepository;

  beforeEach(() => {
    repository = new LLMRepository();
    jest.clearAllMocks();
  });

  it('debería construir el prompt correcto para "analiza"', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ result: 'Respuesta de análisis mockeada' }),
    });

    const instruction: Instruction = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'Por favor, analiza el código',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Respuesta de análisis mockeada');

    const expectedPayload = {
      code: instruction.URL,
      instruction:
        'Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?',
    };

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expectedPayload),
    });
  });

  it('debería construir el prompt correcto para "refactoriza"', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ result: 'Respuesta de refactorización mockeada' }),
    });

    const instruction: Instruction = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'Refactoriza este código',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Respuesta de refactorización mockeada');
  });

  it('debería usar el prompt por defecto si no contiene "analiza" o "refactoriza"', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ result: 'Respuesta default mockeada' }),
    });

    const instruction: Instruction = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'Haz algo con este código',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Respuesta default mockeada');
  });

  it('debería manejar errores y retornar mensaje adecuado', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Falló la red'));

    const instruction: Instruction = {
      URL: 'https://github.com/ejemplo/proyecto',
      value: 'Analiza esto',
    };

    const result = await repository.sendPrompt(instruction);
    expect(result).toBe('Error al comunicarse con el modelo.');
  });
});
