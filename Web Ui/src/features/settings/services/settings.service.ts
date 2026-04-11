import { GetPrompts } from "../../../modules/AIAssistant/application/GetPrompts";
import { UpdatePrompts } from "../../../modules/AIAssistant/application/UpdatePrompts";
import { GetFeatureFlags } from "../../../modules/FeatureFlags/application/GetFeatureFlags";
import { UpdateFeatureFlag } from "../../../modules/FeatureFlags/application/UpdateFeatureFlag";
import { AIPromptResponse } from "../../../modules/AIAssistant/domain/AIAssistantRepositoryInterface";
import { FeatureFlag } from "../../../modules/FeatureFlags/domain/FeatureFlag";

const getPromptsUseCase = new GetPrompts();
const updatePromptsUseCase = new UpdatePrompts();
const getFeatureFlagsUseCase = new GetFeatureFlags();
const updateFeatureFlagUseCase = new UpdateFeatureFlag();

export const settingsService = {
  getPrompts: (): Promise<AIPromptResponse> => {
    return getPromptsUseCase.execute();
  },
  
  updatePrompts: (tddPrompt: string, refactoringPrompt: string, evaluateTDDPrompt: string): Promise<AIPromptResponse> => {
    return updatePromptsUseCase.execute(tddPrompt, refactoringPrompt, evaluateTDDPrompt);
  },

  getFeatureFlags: (): Promise<FeatureFlag[]> => {
    return getFeatureFlagsUseCase.execute();
  },

  updateFeatureFlag: (id: number, newValue: boolean): Promise<FeatureFlag> => {
    return updateFeatureFlagUseCase.execute(id, newValue);
  }
};
