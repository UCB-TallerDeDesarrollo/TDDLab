export interface AIRequest {
    query: string;
    repoUrl?: string;
  }
    
export interface AIResponse {
    result: string;
}