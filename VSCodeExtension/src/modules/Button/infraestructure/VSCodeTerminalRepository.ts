import * as vscode from 'vscode';
import { TerminalPort } from '../model/TerminalPort';
export class VSCodeTerminalRepository implements TerminalPort {
  private getTerminalByName(name: string): vscode.Terminal | undefined {
    return vscode.window.terminals.find(terminal => terminal.name === name);
  }

  createAndExecuteCommand(terminalName: string, command: string): void {
    let terminal = this.getTerminalByName(terminalName);

    if (!terminal) {
      terminal = vscode.window.createTerminal(terminalName);
    }

    terminal.show();
    terminal.sendText(command);
  }
}