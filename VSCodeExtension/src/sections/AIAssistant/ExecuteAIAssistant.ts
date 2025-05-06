import { AIAssistantPanel } from "./AIAssistantPanel";
import * as vscode from "vscode";

let aIAssistantPanel: AIAssistantPanel | undefined;

export class ExecuteAIAssistant {
  async execute(context: vscode.ExtensionContext): Promise<void> {
    if (aIAssistantPanel) {
      aIAssistantPanel.reveal();
    } else {
      aIAssistantPanel = new AIAssistantPanel(context);
      aIAssistantPanel.onDispose(() => {
        aIAssistantPanel = undefined;
      });
    }
    await aIAssistantPanel.getTDDFeedbackFromAI();
  }
}
