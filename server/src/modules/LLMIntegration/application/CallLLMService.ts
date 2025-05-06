import { callHuggingFaceModel } from "../repository/HuggingFaceLLMClient";

export async function CallLLMService(prompt: string): Promise<string> {
  return await callHuggingFaceModel(prompt, "HuggingFaceH4/zephyr-7b-beta"); 
}