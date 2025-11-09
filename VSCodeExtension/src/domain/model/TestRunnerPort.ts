export interface TestRunnerPort {
  runTests(): Promise<string[]>;
}