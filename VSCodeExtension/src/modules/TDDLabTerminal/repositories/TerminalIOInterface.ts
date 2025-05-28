export interface TerminalInput {
  onInput(callback: (data: string) => void): void;
}

export interface TerminalOutput {
  write(message: string): void;
  clear(): void;
  prompt(): void;
}
