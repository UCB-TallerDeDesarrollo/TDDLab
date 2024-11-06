import * as vscode from 'vscode';
import { ExecutionButton } from '../../model/ExecutionButton';

export class ExecutionTreeDataProvider implements vscode.TreeDataProvider<ExecutionButton> {
  getTreeItem(element: ExecutionButton): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ExecutionButton): Thenable<ExecutionButton[]> {
    return Promise.resolve([
      new ExecutionButton(
        'Run Test',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.runTest', title: 'Run Test' },
        '',
        new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green')),
        'Execute TDD Tests'
      ),
      new ExecutionButton(
        'Open New Project',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.cloneCommand', title: 'Open New Project'},
        '',
        new vscode.ThemeIcon('window', new vscode.ThemeColor('charts.white')),
        ''
      )
    ]);
  }
}

export class ExecutionTreeView {
  private treeView: vscode.TreeView<ExecutionButton>;
  private treeDataProvider: ExecutionTreeDataProvider;

  constructor(private context: vscode.ExtensionContext) {
    this.treeDataProvider = new ExecutionTreeDataProvider();
    this.treeView = vscode.window.createTreeView('tddTestExecution', {
      treeDataProvider: this.treeDataProvider
    });
  }

  initialize(): void {
    this.context.subscriptions.push(this.treeView);
  }
}
