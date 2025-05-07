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
}