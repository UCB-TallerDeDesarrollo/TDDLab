import { AnalyzeOrRefactorCodeUseCase } from '../../../../../src/modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { LLMService, Instruction } from '../../../../../src/modules/AIAssistant/domain/AIAssistant'
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