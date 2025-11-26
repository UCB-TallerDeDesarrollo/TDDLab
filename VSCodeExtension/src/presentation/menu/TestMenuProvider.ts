import * as vscode from 'vscode';

type TreeItemChange = TestMenuItem | undefined | null | void;

export class TestMenuItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly command?: vscode.Command,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
    this.command = command;
  }
}

export class TestMenuProvider implements vscode.TreeDataProvider<TestMenuItem> {
  // Marcado como private readonly para cumplir con Sonar
  private readonly _onDidChangeTreeData: vscode.EventEmitter<TreeItemChange> =
    new vscode.EventEmitter<TreeItemChange>();

  readonly onDidChangeTreeData: vscode.Event<TreeItemChange> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TestMenuItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TestMenuItem): Thenable<TestMenuItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.getMenuItems());
    }
  }

  private getMenuItems(): TestMenuItem[] {
    return [
      new TestMenuItem('▶️ Run Tests', {
        command: 'TDD.runTest',
        title: 'Run Tests'
      }),
      new TestMenuItem('📁 Crear Proyecto', {
        command: 'TDD.cloneCommand',
        title: 'Crear Proyecto TDDLab'
      }),
      new TestMenuItem('📊 Show Timeline', {
        command: 'extension.showTimeline',
        title: 'Show Timeline'
      })
    ];
  }
}
