import { AIWebviewPanel } from "../../../../sections/AI/AIWebviewPanel";

let aiWebviewPanel: AIWebviewPanel | undefined;

export class ExecuteAssistantCommand {
    async execute(): Promise<void> {
      if (aiWebviewPanel) {
          aiWebviewPanel.reveal();
        } else {
          aiWebviewPanel = new AIWebviewPanel();
          aiWebviewPanel.onDispose(() => {
            aiWebviewPanel = undefined;
          });
        }
        await aiWebviewPanel.fetchResponse();
    }
  }