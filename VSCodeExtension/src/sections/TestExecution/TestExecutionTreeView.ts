import * as vscode from 'vscode';
import { TestExecutionButton } from '../../modules/RunTestButton/domain/model/TestExecutionButton';

export class TestExecutionTreeDataProvider implements vscode.TreeDataProvider<TestExecutionButton> {
  getTreeItem(element: TestExecutionButton): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TestExecutionButton): Thenable<TestExecutionButton[]> {
    return Promise.resolve([
      new TestExecutionButton(
        'Run Test',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.runTest', title: 'Run Test' },
        '',
        new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green')),
        'Execute TDD Tests'
      )
    ]);
  }
}

export class TestExecutionTreeView {
  private treeView: vscode.TreeView<TestExecutionButton>;
  private treeDataProvider: TestExecutionTreeDataProvider;

  constructor(private context: vscode.ExtensionContext) {
    this.treeDataProvider = new TestExecutionTreeDataProvider();
    this.treeView = vscode.window.createTreeView('tddTestExecution', {
      treeDataProvider: this.treeDataProvider
    });
  }

  initialize(): void {
    this.context.subscriptions.push(this.treeView);
  }
}
