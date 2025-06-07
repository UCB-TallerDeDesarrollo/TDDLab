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
  tdd_analysis: string;
  refactoring: string;
  evaluation: string;
}