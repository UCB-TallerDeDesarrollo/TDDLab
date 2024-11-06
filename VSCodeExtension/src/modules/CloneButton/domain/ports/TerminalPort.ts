export interface TerminalPort {
  createAndExecuteCommand(terminalName: string, command: string): void;
}