export interface TerminalPort {
  createAndExecuteCommand(terminalName: string, command: string): Promise<void>;
  setOnOutputCallback(callback: (output: string) => void): void;
  killCurrentProcess(): void;
}