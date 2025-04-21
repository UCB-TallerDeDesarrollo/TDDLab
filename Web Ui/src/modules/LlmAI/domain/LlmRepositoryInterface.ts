import { LlmRequestObject, LlmResponseObject } from "./llmInterfaces";

interface LlmRepositoryInterface {
  sendPrompt(request: LlmRequestObject): Promise<LlmResponseObject>;
}

export default LlmRepositoryInterface;