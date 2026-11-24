import type {
  CommitLog,
  TDDLogEntry,
} from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

// Muestra reducida de ventasIS/main/script/tdd_log.json observada durante
// la investigación. El archivo remoto contenía 75 commits y 0 ejecuciones.
// Se mantiene local para reproducir el caso sin depender de GitHub.
export const ventasISCommitOnlyLogs: CommitLog[] = [
  {
    commitId: "edb97366326073c5c2422a036aa96814ab696921",
    commitName: "feat:deberia calcular el precio neto cuando se ingresan cantidad 2 y precio 500",
    commitTimestamp: 1788842310556,
    testId: 0,
  },
  {
    commitId: "5b79edee32b7990b831eb15272af571e1c6d7f6c",
    commitName: "feat:deberia calcular el precio neto cuando se ingresan cantidad 1 y precio 250",
    commitTimestamp: 1788842455987,
    testId: 1,
  },
  {
    commitId: "HEAD",
    commitName: "refactor:mejornado la parte del presnter",
    commitTimestamp: 1789018056087,
    testId: 74,
  },
];

// Escenario válido que ya cubrían las pruebas de símbolos y tooltip.
export const mixedTDDLogs: TDDLogEntry[] = [
  {
    commitId: "commit-1",
    commitName: "Primer commit",
    commitTimestamp: 1,
    testId: 1,
  },
  {
    numPassedTests: 3,
    failedTests: 0,
    numTotalTests: 3,
    timestamp: 2,
    success: true,
    testId: 2,
  },
  {
    commitId: "commit-2",
    commitName: "Segundo commit",
    commitTimestamp: 3,
    testId: 3,
  },
  {
    numPassedTests: 2,
    failedTests: 1,
    numTotalTests: 3,
    timestamp: 4,
    success: false,
    testId: 4,
  },
];

// Orden del prototipo: las ejecuciones aparecen antes del commit que las cierra.
export const dashboardTDDLogs: TDDLogEntry[] = [
  { numPassedTests: 2, failedTests: 1, numTotalTests: 3, timestamp: 10, success: false, testId: 101 },
  { numPassedTests: 3, failedTests: 0, numTotalTests: 3, timestamp: 20, success: true, testId: 102 },
  { commitId: "sha-main-1", commitName: "primer commit", commitTimestamp: 30, testId: 102 },
  { numPassedTests: 4, failedTests: 1, numTotalTests: 5, timestamp: 40, success: false, testId: 103 },
  { numPassedTests: 5, failedTests: 0, numTotalTests: 5, timestamp: 50, success: true, testId: 104 },
  { commitId: "sha-main-2", commitName: "segundo commit", commitTimestamp: 60, testId: 104 },
  { numPassedTests: 6, failedTests: 0, numTotalTests: 6, timestamp: 70, success: true, testId: 201 },
  { commitId: "sha-login", commitName: "login", commitTimestamp: 80, testId: 201 },
];
