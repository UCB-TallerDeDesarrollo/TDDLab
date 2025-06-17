import { TDDLogCycleData } from '../domain/TddLogInterface';

export class TddLogAdapter {
  async getTDDLog(owner: string, repoName: string, commitId: string): Promise<TDDLogCycleData[]> {
    const TDD_LOG_URL = `https://raw.githubusercontent.com/${owner}/${repoName}/refs/heads/main/script/tdd_log.json`;

    try {
      const response = await fetch(TDD_LOG_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return [];
      }

      const targetShort = commitId.substring(0, 8);

      // Buscar el índice del commit que coincide
      let commitIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const itemCommitId = item.commitId || item.commit_id || item.sha;
        
        if (itemCommitId) {
          const matches = [
            itemCommitId === commitId,
            itemCommitId.startsWith(targetShort),
            itemCommitId.toLowerCase() === commitId.toLowerCase(),
            itemCommitId.toLowerCase().startsWith(targetShort.toLowerCase())
          ];

          if (matches.some(Boolean)) {
            commitIndex = i;
            break;
          }
        }
      }

      if (commitIndex === -1) {
        return [];
      }

      // Extraer los datos TDD que están ANTES del commit
      const tddCycles: any[] = [];
      
      // Buscar hacia atrás desde el commit encontrado
      for (let i = commitIndex - 1; i >= 0; i--) {
        const item = data[i];
        
        // Si encontramos otro commit, paramos
        if (item.commitId || item.commit_id || item.sha) {
          break;
        }
        
        // Si es un dato de ciclo TDD, lo agregamos
        if (this.isTDDCycleData(item)) {
          tddCycles.unshift(item); // unshift para mantener el orden cronológico
        }
      }

      if (tddCycles.length === 0) {
        return [];
      }

      return this.transformToCycleDataArray(tddCycles);

    } catch (error) {
      throw error;
    }
  }

  private isTDDCycleData(item: any): boolean {
    return item && (
      item.hasOwnProperty('numPassedTests') ||
      item.hasOwnProperty('passedTests') ||
      item.hasOwnProperty('numTotalTests') ||
      item.hasOwnProperty('totalTests') ||
      item.hasOwnProperty('success')
    ) && !item.commitId && !item.commit_id && !item.sha;
  }

  private transformToCycleDataArray(cycles: any[]): TDDLogCycleData[] {
    if (!cycles || cycles.length === 0) {
      return [];
    }

    return cycles.map((cycle: any, index: number) => {
      // Determinar la fase basada en el éxito y número de tests
      let phase: "RED" | "GREEN" | "REFACTOR" | "COMMIT" = 'GREEN';
      
      if (cycle.success === false) {
        phase = 'RED';
      } else if (cycle.success === true) {
        phase = 'GREEN';
      }
      
      // Si hay una fase explícita, usarla (validando que sea correcta)
      if (cycle.phase && ['RED', 'GREEN', 'REFACTOR', 'COMMIT'].includes(cycle.phase)) {
        phase = cycle.phase as "RED" | "GREEN" | "REFACTOR" | "COMMIT";
      }

      return {
        phase: phase,
        timestamp: cycle.timestamp || cycle.time || Date.now(),
        numPassedTests: cycle.numPassedTests || cycle.passedTests || cycle.passed || 0,
        numTotalTests: cycle.numTotalTests || cycle.totalTests || cycle.total || 0,
        success: cycle.success !== undefined ? cycle.success : true,
        commitInfo: {
          id: `cycle_${index}`,
          name: `Step ${index + 1}`,
          timestamp: cycle.timestamp || cycle.time || Date.now()
        }
      };
    });
  }
}