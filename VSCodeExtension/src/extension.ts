import * as vscode from 'vscode';
import { TimelineViewProvider } from './modules/Timeline/application/TimelineViewProvider';
import { CommandService } from './modules/Button/application/commands';
import { TerminalRepository } from './modules/Button/repository/Buttonrepository';
import { MyTreeItem } from './modules/Button/domain/treeItem';
import * as path from 'path';
import * as fs from 'fs';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    const timelineViewProvider = new TimelineViewProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineViewProvider)
    );

    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');

        if (timelineViewProvider.currentWebview) {
            timelineViewProvider.showTimeline(timelineViewProvider.currentWebview);
        }
    });


    const jsonFilePath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'script', 'tdd_log.json');

    // Observa el archivo JSON para detectar cambios
    fs.watch(jsonFilePath, (eventType, filename) => {
        if (eventType === 'change') {
            vscode.commands.executeCommand('workbench.view.extension.timelineContainer');

            if (timelineViewProvider.currentWebview) {
                timelineViewProvider.showTimeline(timelineViewProvider.currentWebview);
            }
        }
    });


    const terminalRepository = new TerminalRepository();
    const commandService = new CommandService(terminalRepository);
    
    let runTestCommand = vscode.commands.registerCommand('TDD.runTest', async () => {
      await commandService.runTestCommand();

      
    });
  
    context.subscriptions.push(runTestCommand);
  
    const myView = vscode.window.createTreeView('myView', {
      treeDataProvider: {
        getTreeItem: (element: MyTreeItem) => element,
        getChildren: () => [
          new MyTreeItem(
            'Run Test', 
            vscode.TreeItemCollapsibleState.None, 
            { command: 'TDD.runTest', title: 'Run Test' },
            '',
            new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green')),
            ''
          )
        ]
      }
    });
  
    context.subscriptions.push(myView);
  }