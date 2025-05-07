import { Request, Response } from "express";
import { IDBJobsRepository } from "../../modules/TDDCycles/Domain/IDBJobsRepository";
import { IDBCommitsRepository } from "../../modules/TDDCycles/Domain/IDBCommitsRepository";
import { IGithubRepository } from "../../modules/TDDCycles/Domain/IGithubRepository";
import { GetTDDCyclesUseCase } from "../../modules/TDDCycles/Application/getTDDCyclesUseCase";
import { GetTestResultsUseCase } from "../../modules/TDDCycles/Application/getTestResultsUseCase";
import { PostTDDLogUseCase } from "../../modules/TDDCycles/Application/postTDDLogUseCase";
import { ITimelineEntry } from "../../modules/TDDCycles/Domain/ITimelineCommit";
import { DBCommitsRepository } from "../../modules/TDDCycles/Repositories/DBCommitsRepository";
import { GetCommitTimeLineUseCase } from "../../modules/TDDCycles/Application/getCommitTimeLineUseCase";



class TDDCyclesController {
  tddCyclesUseCase: GetTDDCyclesUseCase;
  testResultsUseCase: GetTestResultsUseCase;
  submitTDDLogToDB: PostTDDLogUseCase;
  dbCommitsRepository: IDBCommitsRepository;
  dbJobsRepository: IDBJobsRepository;
  getCommitExecutions: GetCommitTimeLineUseCase;
  constructor(
    dbCommitsRepository: IDBCommitsRepository,
    dbJobsRepository: IDBJobsRepository,
    githubRepository: IGithubRepository
  ) {
    this.tddCyclesUseCase = new GetTDDCyclesUseCase(
      dbCommitsRepository,
      githubRepository
    );
    this.testResultsUseCase = new GetTestResultsUseCase(
      dbJobsRepository,
      githubRepository
    );
    this.submitTDDLogToDB = new PostTDDLogUseCase(
      dbJobsRepository,
    );
    this.getCommitExecutions = new GetCommitTimeLineUseCase(
      dbJobsRepository,
    );
    this.dbCommitsRepository=new DBCommitsRepository();
    this.dbJobsRepository = dbJobsRepository;
  }
  async getTDDCycles(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const commits = await this.tddCyclesUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(commits);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
  async getTestResults(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const testResults = await this.testResultsUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(testResults);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getCommitTimeLine(req: Request, res: Response) {
    try {
      const { sha, owner, repoName } = req.query;
      console.log("I am here");
      if (!sha || !owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing sha, owner or repoName" });
      }
  
      const jobData = await this.getCommitExecutions.execute(
        String(sha),
        String(owner),
        String(repoName)
      );

      console.log( "this is the job data",jobData);
  
      return res.status(200).json(jobData);
    } catch (error) {
      console.error("Error getting commit timeline:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  private async insertJobForCommit(
    actualCommitSha: string,
    repoOwner: string,
    repoName: string,
    commitTimelineEntries: ITimelineEntry[]
  ): Promise<void> {
    const lastExecution = commitTimelineEntries.at(-1);
    const color = lastExecution?.color;
    const conclusion = color === "green" ? "success" : "failure";
  
    try {
      await this.dbJobsRepository.saveJobFromTDDLog({
        sha: actualCommitSha,
        owner: repoOwner,
        reponame: repoName,
        conclusion,
      });
      console.log(
        `Insertado el commit ${actualCommitSha} en jobsTable con conclusión ${conclusion}.`
      );
    } catch (error) {
      console.error(
        `Error al insertar el commit ${actualCommitSha} en jobsTable:`,
        error
      );
    }
  }
  
  private async handleJobConclusionUpdate(
    actualCommitSha: string,
    repoOwner: string,
    repoName: string,
    commitTimelineEntries: ITimelineEntry[]
  ): Promise<void> {
    const commitInJobs = await this.dbJobsRepository.findJobByCommit(
      actualCommitSha,
      repoOwner,
      repoName
    );
  
    if (commitInJobs) {
      console.log(`El commit ${actualCommitSha} ya existe en jobsTable.`);
      console.log(`Esta es toda la info que tengo de ese señor commit ${commitInJobs.conclusion}`);
      if (commitInJobs.conclusion === null) {
        console.log(
          `El campo conclusion del commit ${actualCommitSha} está vacío. Procediendo a actualizar.`
        );
        const lastExecution = commitTimelineEntries.at(-1);
        const color = lastExecution?.color;
        const conclusion = color === "green" ? "success" : "failure";
  
        try {
          await this.dbJobsRepository.updateJobConclusion(
            actualCommitSha,
            repoOwner,
            repoName,
            conclusion
          );
          console.log(
            `Actualizada conclusión del commit ${actualCommitSha} a ${conclusion}`
          );
        } catch (error) {
          console.error(
            `Error al actualizar conclusión del commit ${actualCommitSha}:`,
            error
          );
        }
      }
    } else {
      console.log(`No hay registro de job de este commit ${actualCommitSha}, procederé a insertar el registro en la BD`);
      await this.insertJobForCommit(
        actualCommitSha,
        repoOwner,
        repoName,
        commitTimelineEntries
      );
    }
  }

  private async updateTestCountIfNeeded(
    repoOwner: string,
    repoName: string,
    commitSha: string,
    numTotalTests: number
  ): Promise<void> {
    try {
      const commitInCommitsTable = await this.dbCommitsRepository.getCommitBySha(
        repoOwner,
        repoName,
        commitSha
      );
  
      if (commitInCommitsTable) {
        console.log(`commit encontrado en commitsTable: ${commitSha}`);
        console.log(`valor actual de test_count: ${commitInCommitsTable.test_count}`);
        
        if (commitInCommitsTable.test_count === "") {
          console.log(`el test_count está vacío, actualizando con valor: ${numTotalTests}`);
          await this.dbCommitsRepository.updateTestCount(
            repoOwner,
            repoName,
            commitSha,
            numTotalTests
          );
          console.log(`campo test_count actualizado para commit ${commitSha}`);
        }
      } else {
        console.error(`commit ${commitSha} no se encontró en commitsTable (esto no debería ocurrir).`); //ojala que no
      }
    } catch (error) {
      console.error(`error al manejar el campo test_count para el commit ${commitSha}:`, error);
      throw error;
    }
  }
  
  private getColor = (testEntry: any): string => {
    if (testEntry.numTotalTests === 0) {
      return "red";
    } else if (testEntry.numPassedTests === testEntry.numTotalTests) {
      return "green";
    } else {
      return "red";
    }
  };

  private processTDDLogEntries(tddLog: any[], repoOwner: string, repoName: string): { entries: ITimelineEntry[], commits: string[] } {
    const entries: ITimelineEntry[] = [];
    const commitShas: string[] = [];
    let lastCommitIndex = 0;

    for (let i = 0; i < tddLog.length; i++) {
      const entry = tddLog[i];

      if (entry.commitId) {
        const actualCommitSha = entry.commitId;
        commitShas.push(actualCommitSha);

        for (let j = lastCommitIndex; j < i; j++) {
          const testEntry = tddLog[j];
          if (testEntry.numPassedTests !== undefined && testEntry.numTotalTests !== undefined && testEntry.timestamp) {
            const color = this.getColor(testEntry);
            entries.push({
              execution_id: null,
              commit_sha: actualCommitSha,
              execution_timestamp: new Date(testEntry.timestamp),
              number_of_tests: testEntry.numTotalTests,
              passed_tests: testEntry.numPassedTests,
              color,
              repoName,
              repoOwner
            });
          }
        }

        lastCommitIndex = i + 1;
      }
    }

    return { entries, commits: commitShas };
  }

  private determineCycleType(entries: ITimelineEntry[]): string {
    const hasRed = entries.some(entry => entry.color === "red");
    const lastIsGreen = entries.length > 0 && entries[entries.length - 1].color === "green";

    if (hasRed && lastIsGreen) return "RojoVerde";
    if (!lastIsGreen) return "Rojo";
    return "Verde";
  }

  async uploadTDDLog(req: Request, res: Response) {
    try {
      const { repoOwner, repoName, log: tddLog } = req.body;
      if (!repoOwner || !repoName || !tddLog) {
        return res.status(400).json({ error: "Faltan campos requeridos: repoOwner, repoName o log." });
      }

      const { entries: commitTimelineEntries, commits: commitShas } = this.processTDDLogEntries(tddLog, repoOwner, repoName);

      for (const commitSha of commitShas) {
        await this.handleJobConclusionUpdate(commitSha, repoOwner, repoName, commitTimelineEntries);

        const lastExecution = commitTimelineEntries
          .filter(entry => entry.commit_sha === commitSha)
          .at(-1);

        if (lastExecution) {
          await this.updateTestCountIfNeeded(repoOwner, repoName, commitSha, lastExecution.number_of_tests);
        }

        const tddCycle = this.determineCycleType(
          commitTimelineEntries.filter(entry => entry.commit_sha === commitSha)
        );

        try {
          await this.dbCommitsRepository.updateTddCycle(commitSha, tddCycle);
        } catch (error) {
          console.error(`Error al actualizar el commit ${commitSha}: ${error}`);
        }
      }

      await this.submitTDDLogToDB.execute(commitTimelineEntries);

      return res.status(200).json({ message: "Archivo TDD log procesado y registros creados", data: commitTimelineEntries });
    } catch (error) {
      console.error("Error al procesar el archivo TDD log:", error);
      return res.status(500).json({ error: "Error al procesar el archivo TDD log" });
    }
  }
  
  async getCommits(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({ error: "Se requiere owner y repoName" });
      }

      const commits = await this.dbCommitsRepository.getCommits(
        owner as string,
        repoName as string
      );

      return res.status(200).json(commits);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al obtener commits" });
    }
  }
}
export default TDDCyclesController;
