import { TerminalPort } from '../domain/ports/TerminalPort';

export class ExecuteTestCommand {
  constructor(private readonly terminalPort: TerminalPort) {}

  async execute(): Promise<void> {
    await this.terminalPort.createAndExecuteCommand('TDD Terminal', 'npm run tdd-script');
  }
}