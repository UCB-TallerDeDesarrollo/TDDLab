import * as vscode from 'vscode';
import { TerminalPort } from '../../../model/TerminalPort';

export class ExecuteCloneCommand {
  constructor(private readonly terminalPort: TerminalPort) {}

  async execute(): Promise<void> {

    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Open Folder'
    });

    if (folderUri && folderUri.length > 0) {
      const selectedPath = folderUri[0].fsPath;
      const selectedPathUri = vscode.Uri.file(selectedPath);

      this.terminalPort.createAndExecuteCommand(
        'TDD Terminal',
        `git clone https://github.com/denilsFiesta/tddLabBaseProject.git "${selectedPath}"`
      );

      await vscode.commands.executeCommand('vscode.openFolder', selectedPathUri, true);

    } else {
      vscode.window.showWarningMessage('No folder was selected.');
    }
  }
}