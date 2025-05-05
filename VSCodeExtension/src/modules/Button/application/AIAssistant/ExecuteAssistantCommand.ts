import { AIWebviewPanel } from "../../../../sections/AI/AIWebviewPanel";
import * as vscode from 'vscode';

let aiWebviewPanel: AIWebviewPanel | undefined;

export class ExecuteAssistantCommand {
    async execute(context: vscode.ExtensionContext): Promise<void> {
      if (aiWebviewPanel) {
          aiWebviewPanel.reveal();
        } else {
          aiWebviewPanel = new AIWebviewPanel(context);
          aiWebviewPanel.onDispose(() => {
            aiWebviewPanel = undefined;
          });
        }
        await aiWebviewPanel.fetchResponse();
    }
  }