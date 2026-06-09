import { AIAssistantAnswerObject } from "../domain/AIAssistant";

export function mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
  if (!data) {
    return { result: "No se recibio ninguna respuesta del modelo." };
  }

  if (data.error) {
    return { result: `Error del modelo: ${data.error}` };
  }

  return { result: data };
}
