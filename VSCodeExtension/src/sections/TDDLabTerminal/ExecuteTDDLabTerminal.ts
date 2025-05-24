import * as vscode from 'vscode';
import { TerminalPanel } from './TerminalPanel';

export class ExecuteTDDLabTerminal {
  public async execute(context: vscode.ExtensionContext) {
    TerminalPanel.show(context);
  }
}
