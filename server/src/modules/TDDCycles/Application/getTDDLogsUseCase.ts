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
    // 1. Obtener los logs desde GitHub
    const rawLogs = await this.githubRepository.obtainTDDLogs(owner, repoName);

    // 2. Procesar los logs (lógica del frontend movida aquí)
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
    let currentCommit = 1;
    let totalExecutions = 0;
    let currentCommitId = "unknown"; 
    let currentCommitName = "unknown";
    let testId = 0;

    data.forEach((log) => {
      // Si encontramos un commit, incrementamos el contador
      if ('commitId' in log) {
        currentCommit++;
        currentCommitId = log.commitId;
        currentCommitName = log.commitName;
        testId = log.testId
      }

      // Si es una ejecución de prueba, la procesamos
      if ('numPassedTests' in log) {
        if (!commitMap.has(currentCommit)) {
          commitMap.set(currentCommit, {
            commitNumber: currentCommit,
            commitId: currentCommitId,
            commitName: currentCommitName,
            testId: testId,
            tests: []
          });
        }

        const commit = commitMap.get(currentCommit)!;
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

        commit.tests.push(test);
        totalExecutions++;
      }
    });

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