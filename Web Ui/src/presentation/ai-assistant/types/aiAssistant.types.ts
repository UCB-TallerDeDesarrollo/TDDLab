export type AssistantAction = "analiza" | "refactoriza" | "califica";

export type AssistantMessageSource = "user" | "bot";

export interface AssistantMessage {
  id: string;
  from: AssistantMessageSource;
  text: string;
}
