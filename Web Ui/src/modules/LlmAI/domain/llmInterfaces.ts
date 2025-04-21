export interface LlmRequestObject {
    prompt: string;
    repoUrl?: string;  // Añadimos esta propiedad opcional
}
  
export interface LlmResponseObject {
    result: string;
}