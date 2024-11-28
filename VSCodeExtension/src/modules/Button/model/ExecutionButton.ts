import * as vscode from 'vscode';

export class ExecutionButton extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly description?: string,
    public readonly iconPath?: vscode.ThemeIcon,
    public readonly tooltip?: string
  ) {
    super(label, collapsibleState);
    if (command) {
      this.command = command;
    }
    if (description) {
      this.description = description;
    }
    if (iconPath) {
      this.iconPath = iconPath;
    }
    if (tooltip) {
      this.tooltip = tooltip;
    }
  }
}