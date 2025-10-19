import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TerminalPort } from '../../model/TerminalPort';

export class ExecuteCloneCommand {
  constructor(private readonly terminalPort: TerminalPort) {}

  async execute( tddBasePath: string ): Promise<void> {

    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Open Folder'
    });

    if (folderUri && folderUri.length > 0) {
      const selectedPath = folderUri[0].fsPath;
      const selectedPathUri = vscode.Uri.file(selectedPath);

      await fs.cp(tddBasePath, selectedPath, { 
        recursive:true,
        filter: (src) => {
          const basename = path.basename(src);
          return basename !== '.git'; 
        }, 
      });
      await vscode.commands.executeCommand('vscode.openFolder', selectedPathUri, true);

    } else {
      vscode.window.showWarningMessage('No folder was selected.');
    }
  }
}