import { TestResult } from "./TestResult";
export interface RunTests {
  execute(): Promise<TestResult[]>;
}