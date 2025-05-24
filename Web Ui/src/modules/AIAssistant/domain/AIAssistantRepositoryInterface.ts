export interface AIRequest {
  query: string;
  repoUrl?: string;
}
  
export interface AIResponse {
  result: string;
}

export interface AIPromptResponse {
  tddPrompt: string;
  refactoringPrompt: string;
  evaluateTDDPrompt: string;
}

export interface UpdatePromptsRequest {
  analysis_tdd: string;
  refactoring: string;
  evaluate_tdd: string;
}