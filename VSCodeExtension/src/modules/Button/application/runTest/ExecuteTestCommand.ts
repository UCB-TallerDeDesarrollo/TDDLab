import { TerminalPort } from "../../model/TerminalPort";

export class ExecuteTestCommand {
  constructor(private readonly terminalPort: TerminalPort) {}

  async execute(): Promise<void> {
    this.terminalPort.createAndExecuteCommand('TDD Terminal', 'npm run test');
  }
}