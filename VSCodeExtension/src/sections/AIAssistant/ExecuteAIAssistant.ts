import * as vscode from "vscode";
import { AIAssistantPanel } from "./AIAssistantPanel";

let aIAssistantPanel: AIAssistantPanel | undefined;

export class ExecuteAIAssistant {
  async execute(context: vscode.ExtensionContext): Promise<void> {
    // Desactivar la página de bienvenida al iniciar VSCode
    await vscode.workspace.getConfiguration().update(
      "workbench.startupEditor",
      "none", // Esto asegura que no se muestre la página de bienvenida
      vscode.ConfigurationTarget.Global // Aplica globalmente para todos los proyectos
    );

    // Cerrar la barra lateral (si está abierta)
    await vscode.commands.executeCommand('workbench.action.closeSidebar');

    // Aquí vamos a gestionar los editores y grupos
    const editors = vscode.window.visibleTextEditors;
    
    if (editors.length > 1) {
      // Si hay más de un editor abierto, cerramos el editor activo
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        // Guardamos antes de cerrar, si es necesario
        await activeEditor.document.save();
        // Simulamos el comportamiento de Ctrl+F4: Cerrar el editor
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      }
    } else {
      // Si solo hay un editor abierto, no hacemos nada
      await vscode.window.showInformationMessage("Solo hay un editor abierto.");
    }

    // Asegurarse de que el panel de IA no esté abierto por defecto
    if (!aIAssistantPanel) {
      aIAssistantPanel = new AIAssistantPanel(context);
      aIAssistantPanel.onDispose(() => {
        aIAssistantPanel = undefined;
      });
    }

    // Controlar la visibilidad del panel de IA
    aIAssistantPanel.reveal();

    // Obtener retroalimentación de la IA
    await aIAssistantPanel.getTDDFeedbackFromAI();
  }
}
