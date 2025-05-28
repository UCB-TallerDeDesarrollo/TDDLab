import { TerminalInput, TerminalOutput } from './TerminalIOInterface';

export class TerminalIO implements TerminalInput, TerminalOutput {
  constructor(private readonly term: any) {}

  onInput(callback: (data: string) => void): void {
    this.term.onData(callback);
  }

  write(message: string): void {
    this.term.write(message);
  }

  clear(): void {
    this.term.clear();
  }

  prompt(): void {
    this.term.write('\r\n$ ');
  }
}
