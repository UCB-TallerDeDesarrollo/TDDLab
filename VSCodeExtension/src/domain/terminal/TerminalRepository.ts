export interface TerminalRepository {
  runCommand(command: string): Promise<string>;
}