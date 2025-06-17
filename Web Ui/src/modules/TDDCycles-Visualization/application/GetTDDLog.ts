import { TddLogAdapter } from '../repository/TddLogAdapter';
import { TDDLogCycleData } from '../domain/TddLogInterface';

export class GetTDDLog {
  constructor(private tddLogAdapter: TddLogAdapter) {}

  async execute(owner: string, repoName: string, commitId: string): Promise<TDDLogCycleData[]> {
    if (!commitId || commitId.trim() === '') {
      throw new Error('Commit ID is required');
    }

    try {
      let cycleData = await this.tddLogAdapter.getTDDLog(owner, repoName, commitId.trim());

      if (!cycleData || cycleData.length === 0) {
        // Try with short SHA if nothing is found
        if (commitId.length > 8) {
          const shortSha = commitId.substring(0, 8);
          cycleData = await this.tddLogAdapter.getTDDLog(owner, repoName, shortSha);
        }
      }

      return cycleData || [];

    } catch (error) {
      throw new Error(`Error al obtener datos del ciclo TDD: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
