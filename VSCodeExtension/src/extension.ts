import * as vscode from 'vscode';
import { TimelineView } from './sections/Timeline/TimelineView';
import * as path from 'path';
import * as fs from 'fs';
import { ExecuteTestCommand } from './modules/RunTestButton/application/ExecuteTestCommand';
import { VSCodeTerminalRepository } from './modules/RunTestButton/repository/VSCodeTerminalRepository';
import { TestExecutionTreeView } from './sections/TestExecution/TestExecutionTreeView';
import { ExecuteCloneCommand } from './modules/CloneButton/application/ExecuteCloneCommand';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
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

    const jsonFilePath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'script', 'tdd_log.json');

    // Observa el archivo JSON para detectar cambios
    fs.watch(jsonFilePath, (eventType, filename) => {
        if (eventType === 'change') {
            vscode.commands.executeCommand('workbench.view.extension.timelineContainer');

            if (timelineView.currentWebview) {
              timelineView.showTimeline(timelineView.currentWebview);
            }
        }
    });

    const terminalRepository = new VSCodeTerminalRepository();
    const executeTestCommand = new ExecuteTestCommand(terminalRepository);

    const executeCloneCommand = new ExecuteCloneCommand(terminalRepository);
    
    const runTestCommand = vscode.commands.registerCommand('TDD.runTest', async () => {
      await executeTestCommand.execute();
    });

    const runCloneCommand = vscode.commands.registerCommand('TDD.cloneCommand', async () => {
      await executeCloneCommand.execute();
    });
  
    context.subscriptions.push(runTestCommand);
    context.subscriptions.push(runCloneCommand);

    const testExecutionTreeView = new TestExecutionTreeView(context);
    testExecutionTreeView.initialize();
  
  }