import * as vscode from 'vscode';
import { TimelineView } from './sections/Timeline/TimelineView';
import * as path from 'path';
import * as fs from 'fs';
import { ExecuteTestCommand } from './modules/RunTestButton/application/ExecuteTestCommand';
import { VSCodeTerminalRepository } from './repository/VSCodeTerminalRepository';
import { ExecutionTreeView } from './sections/ExecutionTree/ExecutionTreeView';
import { ExecuteCloneCommand } from './modules/CloneButton/application/ExecuteCloneCommand';
import { ExecuteExportCommand } from './modules/ExportButton/application/ExecuteExportCommand';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    const tddBasePath = path.join(context.extensionPath, 'resources', 'TDDLabBaseProject');
    const timelineView = new TimelineView(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineView)
    );

    if (timelineView.currentWebview) {
        timelineView.showTimeline(timelineView.currentWebview);
    }

    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');
        if (timelineView.currentWebview) {
            timelineView.showTimeline(timelineView.currentWebview);
        }
    });

    const terminalRepository = new VSCodeTerminalRepository();
    const executeTestCommand = new ExecuteTestCommand(terminalRepository);
    const executeCloneCommand = new ExecuteCloneCommand(terminalRepository);
    const executeExportCommand = new ExecuteExportCommand();

    const runTestCommand = vscode.commands.registerCommand('TDD.runTest', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspaceFolder) {
            vscode.window.showErrorMessage(
                'No hay un proyecto abierto. Por favor, abre un proyecto para ejecutar la extensión.'
            );
            return;
        }

        const projectJsonPath = path.join(workspaceFolder, 'script', 'tdd_log.json');

        try {
            if (!fs.existsSync(projectJsonPath)) {
                throw new Error(
                    'El archivo "tdd_log.json" no se encontró en la carpeta raíz del proyecto dentro de "script".'
                );
            }

            const stats = fs.statSync(projectJsonPath);
            if (!stats.isFile()) {
                throw new Error('El archivo "tdd_log.json" no es un archivo válido.');
            }

            // Ejecuta los comandos si todo está correcto
            await executeTestCommand.execute();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Se produjo un error desconocido.';
            vscode.window.showErrorMessage(`Error al ejecutar la extensión: ${message}`);
        }
    });

    const runTestActivityCommand = vscode.commands.registerCommand('TDD.runTestActivity', async () => {
        await executeTestCommand.execute();
    });

    const runCloneCommand = vscode.commands.registerCommand('TDD.cloneCommand', async () => {
        await executeCloneCommand.execute(tddBasePath);
    });

    const runExportCommand = vscode.commands.registerCommand('TDD.exportCommand', async () => {
        await executeExportCommand.execute();
    });

    context.subscriptions.push(runTestCommand);
    context.subscriptions.push(runTestActivityCommand);
    context.subscriptions.push(runCloneCommand);
    context.subscriptions.push(runExportCommand);

    const testExecutionTreeView = new ExecutionTreeView(context);
    testExecutionTreeView.initialize();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const jsonFilePath = path.join(workspaceFolder, 'script', 'tdd_log.json');

    // Observa el archivo JSON para detectar cambios si existe
    if (fs.existsSync(jsonFilePath)) {
        fs.watch(jsonFilePath, (eventType, filename) => {
            if (eventType === 'change') {
                if (timelineView.currentWebview) {
                    timelineView.showTimeline(timelineView.currentWebview);
                }
            }
        });
    }
}
