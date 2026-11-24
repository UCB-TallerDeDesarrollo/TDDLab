import { indexTestsByCommit, testResult } from "../../../src/modules/TDDCycles-Visualization/application/commitExecutions";

const execution = (testId: number, timestamp: number) => ({
  testId, timestamp, numTotalTests: 0, numPassedTests: 0, failedTests: 0, success: true,
});
const commit = (testId: number, commitId: string) => ({
  testId, commitId, commitName: "Cambio", commitTimestamp: 20,
});

it("ordena las ejecuciones por SHA y conserva solo los vínculos inequívocos", () => {
  const late = execution(0, 10);
  const early = execution(0, 0);
  const logs = Object.freeze([
    late, commit(1, "HEAD"), execution(2, 3), commit(0, "abcdef123456"),
    early, commit(0, "abcdef123456"), execution(1, 4), commit(2, "otro"),
    commit(2, "distinto"), execution(3, 7),
  ]);
  expect([...indexTestsByCommit(logs)]).toEqual([["abcdef123456", [early, late]]]);
  expect(logs[0]).toBe(late);
});

it("distingue un resultado desconocido de cero pruebas fallidas", () => {
  expect(testResult({ failedTests: 0 })).toBe("unknown");
  expect(testResult({ failedTests: 0, success: true })).toBe("success");
  expect(testResult({ failedTests: 1 })).toBe("failure");
});
