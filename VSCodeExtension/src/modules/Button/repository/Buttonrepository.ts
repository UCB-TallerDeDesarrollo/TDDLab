import * as vscode from 'vscode';

export class TerminalRepository {
  private getTerminalByName(name: string): vscode.Terminal | undefined {
    return vscode.window.terminals.find(terminal => terminal.name === name);
  }

  createTerminal(name: string, command: string): void {
    let terminal = this.getTerminalByName(name);

    // Si no existe, crea una nueva terminal
    if (!terminal) {
      terminal = vscode.window.createTerminal(name);
    }

    terminal.show();
    terminal.sendText(command);
  }
}
