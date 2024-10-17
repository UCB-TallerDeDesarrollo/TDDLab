import * as vscode from 'vscode';

export class TerminalRepository {
  createTerminal(name: string, command: string): void {
    const terminal = vscode.window.createTerminal(name);
    terminal.show();
    terminal.sendText(command);
  }
}
