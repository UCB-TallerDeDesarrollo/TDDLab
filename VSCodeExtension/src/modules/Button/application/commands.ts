import { TerminalRepository } from '../repository/Buttonrepository';

export class CommandService {
  constructor(private terminalRepository: TerminalRepository) {}

  async runTestCommand() {
    await this.terminalRepository.createTerminal('TDD Terminal', 'npm run tdd-script');
  }
}
