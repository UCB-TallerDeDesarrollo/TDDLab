import { TestRunnerPort } from '../../domain/model/TestRunnerPort';

export class ExecuteTestCommand {
  constructor(private readonly testRunner: TestRunnerPort) {}

  async execute(): Promise<string[]> {
    return await this.testRunner.runTests();
  }
}