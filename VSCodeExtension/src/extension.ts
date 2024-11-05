import * as vscode from 'vscode';
import { TimelineView } from './sections/Timeline/TimelineView';
import { CommandService } from './modules/Button/application/commands';
import { TerminalRepository } from './modules/Button/repository/Buttonrepository';
import { MyTreeItem } from './modules/Button/domain/treeItem';
import * as path from 'path';
import * as fs from 'fs';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    const timelineView = new TimelineView(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineView)
    );

    if (timelineView.currentWebview) {
      vscode.window.showInformationMessage('entra aqui');
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