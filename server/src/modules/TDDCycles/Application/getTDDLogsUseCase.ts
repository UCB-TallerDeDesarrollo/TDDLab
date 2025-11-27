import { IGithubRepository } from "../Domain/IGithubRepository";
import { TDDLogEntry } from "../Domain/ITDDLogEntry";
import { 
  ProcessedTDDResponse, 
  ProcessedCommitData, 
  ProcessedTest 
} from "../Domain/IProcessedTDDData";

export class GetTDDLogsUseCase {
  constructor(private readonly githubRepository: IGithubRepository) {}

  async execute(owner: string, repoName: string): Promise<ProcessedTDDResponse> {
    const rawLogs = await this.githubRepository.obtainTDDLogs(owner, repoName);
    return this.processLogs(rawLogs);
  }

  private processLogs(data: TDDLogEntry[]): ProcessedTDDResponse {
    if (!data || data.length === 0) {
      return {
        commits: [],
        summary: {
          totalCommits: 0,
          totalExecutions: 0
        }
      };
    }

    const commitMap = new Map<number, ProcessedCommitData>();
    let commitNumber = 0;
    let totalExecutions = 0;
    let pendingTests: ProcessedTest[] = []; // Tests que se asignarán al SIGUIENTE commit

    data.forEach((log) => {
      // Si es una ejecución de prueba, la acumulamos
      if ('numPassedTests' in log) {
        const passed = (log.failedTests === 0) && (log.success === true);
        const test: ProcessedTest = { 
          numPassedTests: Number(log.numPassedTests),
          failedTests: Number(log.failedTests),
          numTotalTests: Number(log.numTotalTests),
          timestamp: Number(log.timestamp),
          success: log.success,
          testId: log.testId,
          passed, 
          size: 1 
        };

        // Agregar test al array de tests pendientes
        pendingTests.push(test);
      }
      
      // Si encontramos un commit, le asignamos los tests acumulados
      if ('commitId' in log) {
        // Incrementamos el número de commit
        commitNumber++;

        // Crear entrada para el nuevo commit con los tests pendientes
        commitMap.set(commitNumber, {
          commitNumber: commitNumber,
          commitId: log.commitId,
          commitName: log.commitName,
          testId: log.testId,
          tests: [...pendingTests] // Asignar los tests acumulados a ESTE commit
        });

        // Actualizar el contador de ejecuciones totales
        totalExecutions += pendingTests.length;

        // Limpiar el array de tests pendientes para el siguiente commit
        pendingTests = [];
      }
    });

    // Si quedan tests pendientes al final (no deberían, pero por seguridad)
    if (pendingTests.length > 0) {
      console.warn('Tests sin commit asociado al final del log:', pendingTests);
    }

    const commits = Array.from(commitMap.values());

    return {
      commits,
      summary: {
        totalCommits: commits.length,
        totalExecutions
      }
    };
  }
}