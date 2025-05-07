import * as vscode from "vscode";
import { AIAssistantPanel } from "./AIAssistantPanel";

let aIAssistantPanel: AIAssistantPanel | undefined;

export class ExecuteAIAssistant {
  async execute(context: vscode.ExtensionContext): Promise<void> {
    // Desactivar la página de bienvenida al iniciar VSCode
    await vscode.workspace.getConfiguration().update(
      "workbench.startupEditor",
      "none",
      vscode.ConfigurationTarget.Global
    );

    // Cerrar la barra lateral (si está abierta)
    await vscode.commands.executeCommand('workbench.action.closeSidebar');

    // Asegurarse de que el panel de IA no esté abierto por defecto
    const panel = AIAssistantPanel.getInstance(context);
    panel.reveal(); // Esto debería enfocar el panel y desplazar otros editores

    // Obtener retroalimentación de la IA
    await panel.getTDDFeedbackFromAI();
  }
}