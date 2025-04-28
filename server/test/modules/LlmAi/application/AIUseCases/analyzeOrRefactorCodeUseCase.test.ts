import { AnalyzeOrRefactorCodeUseCase } from '../../../../../src/modules/LlmAi/application/AIUseCases/analyzeOrRefactorCodeUseCase';
import { LLMService, Instruction } from '../../../../../src/modules/LlmAi/domain/LlmAI'
;
describe('AnalyzeOrRefactorCodeUseCase', () => {
  const mockLLMService: jest.Mocked<LLMService> = {
    sendPrompt: jest.fn()
  };

  const useCase = new AnalyzeOrRefactorCodeUseCase(mockLLMService);

  it('debe enviar el prompt y retornar la respuesta', async () => {
    const instruction: Instruction = { URL: 'https://github.com/ejemplo', value: 'analizar' };
    mockLLMService.sendPrompt.mockResolvedValue('Resultado esperado');

    const result = await useCase.execute(instruction);

    expect(mockLLMService.sendPrompt).toHaveBeenCalledWith(instruction);
    expect(result).toBe('Resultado esperado');
  });
});