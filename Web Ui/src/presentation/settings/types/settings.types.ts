export type FeatureFlag = {
  id: number;
  feature_name: string;
  is_enabled: boolean;
};

export type PromptsData = {
  tddPrompt: string;
  refactoringPrompt: string;
  evaluateTDDPrompt: string;
};
