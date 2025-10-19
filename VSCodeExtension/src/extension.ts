import * as vscode from 'vscode';
import { TimelineView } from './sections/Timeline/TimelineView';
import * as path from 'path';
import * as fs from 'fs';
import { ExecuteTestCommand } from './modules/Button/application/runTest/ExecuteTestCommand';
import { VSCodeTerminalRepository } from './modules/Button/infraestructure/VSCodeTerminalRepository';
import { ExecutionTreeView } from './sections/ExecutionTree/ExecutionTreeView';
import { ExecuteCloneCommand } from './modules/Button/application/clone/ExecuteCloneCommand';
import { ExecuteExportCommand } from './modules/Button/application/export/ExecuteExportCommand';
import { ExecuteAIAssistant } from './sections/AIAssistant/ExecuteAIAssistant';
import { TerminalViewProvider } from './sections/TDDLabTerminal/TerminalViewProvider';
import { FeatureConfigLoader } from './FeatureConfigLoader';

/**
 * @param {vscode.ExtensionContext} context
 */

export async function activate(context: vscode.ExtensionContext) {
    const tddBasePath = path.join(context.extensionPath, 'resources', 'TDDLabBaseProject');
    let isInitialRun = true;
    let features: { [key: string]: boolean } = FeatureConfigLoader.load(context);

    const terminalRepository = new VSCodeTerminalRepository();
    const executeTestCommand = new ExecuteTestCommand(terminalRepository);
    const executeCloneCommand = new ExecuteCloneCommand(terminalRepository);
    const executeExportCommand = new ExecuteExportCommand();
    const executeAIAssistant = new ExecuteAIAssistant();

    if (features.tddTerminalView) {
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                TerminalViewProvider.viewType,
                new TerminalViewProvider(context)
            )
        );
    }
    

    const timelineView = new TimelineView(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineView)
    );

    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');
        if (timelineView.currentWebview) {
            timelineView.showTimeline(timelineView.currentWebview);
        }
    });

    const jsonFilePath = path.join(
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
        'script',
        'tdd_log.json'
    );

    const updateTimeLine = () => {
        if (timelineView.currentWebview) {
            timelineView.showTimeline(timelineView.currentWebview);
        }
    };

    const watchFile = () => {
        fs.watch(jsonFilePath, (eventType, filename) => {
            if (eventType === 'change') {
                updateTimeLine();
            }
        });
        if (isInitialRun) {
            updateTimeLine();
            isInitialRun = false;
        }
    };

    if (fs.existsSync(jsonFilePath)) {
        watchFile();
    } else {
        const interval = setInterval(() => {
            if (fs.existsSync(jsonFilePath)) {
                clearInterval(interval);
                watchFile();
            }
        }, 1000);
    }


    const runTestCommand = vscode.commands.registerCommand('TDD.runTest', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspaceFolder) {
            vscode.window.showErrorMessage(
                'TDD Lab: No hay un espacio de trabajo abierto. Por favor, abre un proyecto adecuado para ejecutar la extensión.'
            );
            return;
        }

        const projectJsonPath = path.join(workspaceFolder, 'script', 'tddScript.js');

        try {
            if (!fs.existsSync(projectJsonPath)) {
                throw new Error(
                    'Este no es un proyecto compatible con la extension, asegurate de abrir un proyecto adecuado.'
                );
            }

            const stats = fs.statSync(projectJsonPath);
            if (!stats.isFile()) {
                throw new Error('El archivo "tdd_log.json" no es un archivo válido.');
            }

            await executeTestCommand.execute();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Se produjo un error desconocido.';
            vscode.window.showErrorMessage(`TDD Lab: Error al ejecutar la extensión. ${message}`);
        }
    });

    const runTestActivityCommand = vscode.commands.registerCommand('TDD.runTestActivity', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspaceFolder) {
            vscode.window.showErrorMessage(
                'TDD Lab: No hay un espacio de trabajo abierto. Por favor, abre un proyecto adecuado y compatible para ejecutar la extensión.'
            );
            return;
        }

        try {
            const projectJsonPath = path.join(workspaceFolder, 'script', 'tddScript.js');
            if (!fs.existsSync(projectJsonPath)) {
                vscode.window.showErrorMessage(
                    'TDD Lab: Este no es un proyecto compatible con la extension, asegurate de abrir un proyecto adecuado.'
                );
                return;
            }
            await executeTestCommand.execute();
        } catch (error) {
            vscode.window.showErrorMessage('Ocurrió un error al intentar ejecutar la prueba.');
        }
    });

    const runCloneCommand = vscode.commands.registerCommand('TDD.cloneCommand', async () => {
        try {
            await executeCloneCommand.execute(tddBasePath);
        } catch (error) {
            vscode.window.showErrorMessage('Error al clonar el proyecto. Por favor, verifica la configuración.');
        }
    });

    const runExportCommand = vscode.commands.registerCommand('TDD.exportCommand', async () => {
        try {
            await executeExportCommand.execute();
        } catch (error) {
            vscode.window.showErrorMessage('Error al exportar los datos. Por favor, intenta nuevamente.');
        }
    });

    const runAsistenteCommand = vscode.commands.registerCommand('TDD.AsistenteCommand', async () => {
        try {
            await executeAIAssistant.execute(context);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error?.message}`);
        }
    });

    context.subscriptions.push(runTestCommand);
    context.subscriptions.push(runTestActivityCommand);
    context.subscriptions.push(runCloneCommand);
    context.subscriptions.push(runExportCommand);
    context.subscriptions.push(runAsistenteCommand);

    const testExecutionTreeView = new ExecutionTreeView(context, features);
    testExecutionTreeView.initialize();



  
}
