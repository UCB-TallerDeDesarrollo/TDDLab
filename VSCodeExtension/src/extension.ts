import * as vscode from 'vscode';
import { TimelineView } from './sections/Timeline/TimelineView';
import * as path from 'path';
import * as fs from 'fs';
import { ExecuteTestCommand } from './modules/RunTestButton/application/ExecuteTestCommand';
import { VSCodeTerminalRepository } from './repository/VSCodeTerminalRepository';
import { ExecutionTreeView } from './sections/ExecutionTree/ExecutionTreeView';
import { ExecuteCloneCommand } from './modules/CloneButton/application/ExecuteCloneCommand';
import { ExecutePostCommand } from './modules/PostButton/application/ExecutePostCommand';

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
            

            if (timelineView.currentWebview) {
              timelineView.showTimeline(timelineView.currentWebview);
            }
        }
    });

    const terminalRepository = new VSCodeTerminalRepository();
    const executeTestCommand = new ExecuteTestCommand(terminalRepository);

    const executeCloneCommand = new ExecuteCloneCommand(terminalRepository);
    
    const executePostCommand = new ExecutePostCommand(terminalRepository);

    const runTestCommand = vscode.commands.registerCommand('TDD.runTest', async () => {
      await executeTestCommand.execute();
    });

    const runTestActivityCommand = vscode.commands.registerCommand('TDD.runTestActivity', async () => {
      await executeTestCommand.execute();
    });

    const runCloneCommand = vscode.commands.registerCommand('TDD.cloneCommand', async () => {
      await executeCloneCommand.execute();
    });

    const runPostCommand = vscode.commands.registerCommand('TDD.postCommand', async () => {
      await executePostCommand.execute();
    });
  
    context.subscriptions.push(runTestCommand);
    context.subscriptions.push(runTestActivityCommand);
    context.subscriptions.push(runCloneCommand);
    context.subscriptions.push(runPostCommand);

    const testExecutionTreeView = new ExecutionTreeView(context);
    testExecutionTreeView.initialize();
  
  }