import { AnalyzeOrRefactorCodeUseCase } from '../../../../../src/modules/AIAssistant/application/AIAssistantUseCases/analyzeOrRefactorCodeUseCase';
import { AIAssistantInstructionObject, AIAssistantAnswerObject } from '../../../../../src/modules/AIAssistant/domain/AIAssistant';
import { AIAssistantRepository } from '../../../../../src/modules/AIAssistant/repository/AIAssistantRepositoy';

describe('AnalyzeOrRefactorCodeUseCase', () => {
  const mockRepository: jest.Mocked<AIAssistantRepository> = {
    sendPrompt: jest.fn()
  } as unknown as jest.Mocked<AIAssistantRepository>;

  const useCase = new AnalyzeOrRefactorCodeUseCase(mockRepository);

  it('debe enviar el prompt y retornar la respuesta', async () => {
    const instruction: AIAssistantInstructionObject = {
      URL: 'https://github.com/ejemplo',
      value: 'analizar'
    };

    const mockResponse: AIAssistantAnswerObject = {
      result: 'Resultado esperado'
    };

    mockRepository.sendPrompt.mockResolvedValue(mockResponse);

    const result = await useCase.execute(instruction);

    expect(mockRepository.sendPrompt).toHaveBeenCalledWith(instruction);
    expect(result).toEqual(mockResponse);
  });
});
