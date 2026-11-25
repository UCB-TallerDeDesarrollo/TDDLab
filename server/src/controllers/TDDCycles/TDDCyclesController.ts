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
import { GetCommitHistoryUseCase } from "../../modules/TDDCycles/Application/getCommitHistoryUseCase";
import { GetCommitCyclesUseCase } from "../../modules/TDDCycles/Application/getCommitCyclesUseCase";
import { ITestResultRegistrationRepository } from "../../modules/TDDCycles/Domain/ITestResultRegistrationRepository";
import { RegisterTestResultUseCase } from "../../modules/TDDCycles/Application/registerTestResultUseCase";
import { TestResultValidationError } from "../../modules/TDDCycles/Application/TestResultValidationError";
import { isValidBranch } from "../../modules/TDDCycles/Domain/RepositoryRef";
import { TDDCycleDataObject } from "../../modules/TDDCycles/Domain/TDDCycleDataObject";




class TDDCyclesController {
  private readonly registerTestResultUseCase: RegisterTestResultUseCase | null;
  tddCyclesUseCase: GetTDDCyclesUseCase;
  testResultsUseCase: GetTestResultsUseCase;
  submitTDDLogToDB: PostTDDLogUseCase;
  dbCommitsRepository: IDBCommitsRepository;
  dbJobsRepository: IDBJobsRepository;
  getCommitExecutions: GetCommitTimeLineUseCase;
  getCommitHistoryUseCase: GetCommitHistoryUseCase;
  getCommitCyclesUseCase: GetCommitCyclesUseCase;
  private readonly githubRepository: IGithubRepository;

  constructor(
    dbCommitsRepository: IDBCommitsRepository,
    dbJobsRepository: IDBJobsRepository,
    githubRepository: IGithubRepository,
    registrationRepository: ITestResultRegistrationRepository | null = null
  ) {
    this.githubRepository = githubRepository;
    this.registerTestResultUseCase = registrationRepository ? new RegisterTestResultUseCase(registrationRepository) : null;
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
    this.getCommitHistoryUseCase = new GetCommitHistoryUseCase(githubRepository);
    this.getCommitCyclesUseCase = new GetCommitCyclesUseCase(githubRepository);
    this.dbCommitsRepository = new DBCommitsRepository();
    this.dbJobsRepository = dbJobsRepository;
  }
  async registerTestResult(req: Request, res: Response) {
    if (!this.registerTestResultUseCase) {
      return res.status(503).json({ error: "Registration repository unavailable" });
    }
    try {
      const status = await this.registerTestResultUseCase.execute(req.body);
      const httpStatus = status === "created" ? 201 : status === "duplicate" ? 200 : 409;
      return res.status(httpStatus).json({ status });
    } catch (error) {
      if (error instanceof TestResultValidationError) {
        return res.status(400).json({ error: error.message, field: error.field });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Persists the two versioned TDD logs in the relational tables used by the
   * legacy visualization flow. The job registration remains handled by
   * POST /jobs so it keeps its idempotency contract.
   */
  async ingestTDDLogs(req: Request, res: Response) {
    const { repoOwner, repoName, commitHistory, tddLog, sha, branch } = req.body ?? {};
    if (!this.isValidGithubSegment(repoOwner) || !this.isValidGithubSegment(repoName) ||
        !Array.isArray(commitHistory) || !Array.isArray(tddLog) ||
        typeof branch !== "string" || !isValidBranch(branch)) {
      return res.status(400).json({ error: "Faltan repoOwner, repoName, commitHistory o tddLog válidos" });
    }

    try {
      const normalizedLog = tddLog.map((entry: any) =>
        entry?.commitId === "HEAD" && typeof sha === "string"
          ? { ...entry, commitId: sha }
          : entry
      );
      const hookTimestamps = new Map(
        normalizedLog
          .filter((entry: any) => entry?.commitId && entry?.commitTimestamp)
          .map((entry: any) => [entry.commitId, Number(entry.commitTimestamp)])
      );

      for (const entry of commitHistory) {
        const entrySha = entry?.sha === "HEAD" ? sha : entry?.sha;
        if (typeof entrySha !== "string" || !entrySha || entrySha === "HEAD") continue;
        if (await this.dbCommitsRepository.commitExists(repoOwner, repoName, entrySha)) continue;

        const commit: TDDCycleDataObject = {
          html_url: entry.html_url ?? entry.commit?.url ?? "",
          sha: entrySha,
          stats: {
            total: Number(entry.stats?.total ?? 0),
            additions: Number(entry.stats?.additions ?? 0),
            deletions: Number(entry.stats?.deletions ?? 0),
          },
          commit: {
            date: entry.commit?.date ?? new Date().toISOString(),
            message: entry.commit?.message ?? "",
            url: entry.commit?.url ?? "",
            comment_count: Number(entry.commit?.comment_count ?? 0),
          },
          coverage: String(entry.coverage ?? "0"),
          test_count: String(entry.test_count ?? "0"),
          branch,
          author: String(entry.author ?? ""),
          stats_date: entry.stats?.date,
          failed_tests: Number(entry.failed_tests ?? 0),
          conclusion: String(entry.conclusion ?? ""),
          hook_timestamp: hookTimestamps.get(entrySha),
        };
        await this.dbCommitsRepository.saveCommit(repoOwner, repoName, commit);
      }

      req.body = { repoOwner, repoName, branch, log: normalizedLog };
      return this.uploadTDDLog(req, res);
    } catch (error) {
      console.error("Error al ingerir los logs TDD:", error);
      return res.status(500).json({ error: "Error al guardar los logs TDD" });
    }
  }
  //NO SE USA
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
  //NO SE USA
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

  isValidGithubSegment(value: unknown): value is string {
    return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= 100 &&
      /^[A-Za-z0-9._-]+$/.test(value)
    );
  }

  //SÍ SE USA
  // New: proxy and map commit-history.json from GitHub (frontend logic moved server-side)
  async getCommitHistory(req: Request, res: Response) {
    try {
      const ownerRaw = req.query.owner;
      const repoNameRaw = req.query.repoName;

      if (!ownerRaw || !repoNameRaw) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName"
        });
      }

      if (!this.isValidGithubSegment(ownerRaw) || !this.isValidGithubSegment(repoNameRaw)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName"
        });
      }

      const branchRaw = req.query.branch;
      if (branchRaw !== undefined && !isValidBranch(branchRaw)) {
        return res.status(400).json({ error: "Bad request, invalid branch" });
      }
      const owner = ownerRaw;
      const repoName = repoNameRaw;

      const commits = branchRaw === undefined
        ? await this.getCommitHistoryUseCase.execute(String(owner), String(repoName))
        : await this.getCommitHistoryUseCase.execute(String(owner), String(repoName), String(branchRaw));
      return res.status(200).json(commits);
    } catch (error) {
      console.error("Error fetching commit history:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // SÍ SE USA
  // New: commit cycles endpoint using the same raw file
  async getCommitCycles(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res.status(400).json({ error: "Bad request, missing owner or repoName" });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({ error: "Bad request, invalid owner or repoName" });
      }

      const branchRaw = req.query.branch;
      if (branchRaw !== undefined && !isValidBranch(branchRaw)) {
        return res.status(400).json({ error: "Bad request, invalid branch" });
      }


      const commits = branchRaw === undefined
        ? await this.getCommitCyclesUseCase.execute(String(owner), String(repoName))
        : await this.getCommitCyclesUseCase.execute(String(owner), String(repoName), String(branchRaw));
      return res.status(200).json(commits);
    } catch (error) {
      console.error("Error fetching commit cycles:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getBranches(req: Request, res: Response) {
    const { owner, repoName } = req.query;
    if (!owner || !repoName || !this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
      return res.status(400).json({ error: "Bad request, invalid owner or repoName" });
    }
    try {
      return res.status(200).json({ branches: await this.githubRepository.getBranches(String(owner), String(repoName)) });
    } catch (error) {
      console.error("Error fetching branches:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getBranchSnapshot(req: Request, res: Response) {
    const { owner, repoName, branch } = req.query;
    if (!owner || !repoName || !branch || !this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName) || !isValidBranch(branch)) {
      return res.status(400).json({ error: "Bad request, invalid repository or branch" });
    }
    try {
      const snapshot = await this.githubRepository.getBranchSnapshot(String(owner), String(repoName), String(branch));
      return res.status(200).json(snapshot);
    } catch (error: any) {
      if (error?.status === 404) return res.status(404).json({ error: "BRANCH_NOT_FOUND" });
      if (error?.message === "INVALID_BRANCH") return res.status(400).json({ error: "INVALID_ARGUMENT" });
      console.error("Error fetching branch snapshot:", error);
      return res.status(503).json({ error: "SNAPSHOT_UNAVAILABLE" });
    }
  }

  // NO SE USA
  async getCommitTimeLine(req: Request, res: Response) {
    try {
      const { sha, owner, repoName } = req.query;
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
  
      return res.status(200).json(jobData);
    } catch (error) {
      console.error("Error getting commit timeline:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  //NO SE USA
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
    } catch (error) {
      console.error(
        `Error al insertar el commit ${actualCommitSha} en jobsTable:`,
        error
      );
    }
  }
  
  //NO SE USA
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
      if (commitInJobs.conclusion === null) {
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
        } catch (error) {
          console.error(
            `Error al actualizar conclusión del commit ${actualCommitSha}:`,
            error
          );
        }
      }
    } else {
      await this.insertJobForCommit(
        actualCommitSha,
        repoOwner,
        repoName,
        commitTimelineEntries
      );
    }
  }

  //NO SE USA
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
        if (commitInCommitsTable.test_count === "") {
          await this.dbCommitsRepository.updateTestCount(
            repoOwner,
            repoName,
            commitSha,
            numTotalTests
          );
        }
      } else {
        console.error("commit no se encontró en commitsTable (esto no debería ocurrir).");
      }
    } catch (error) {
      console.error("error al manejar el campo test_count para el commit", error);
      throw error;
    }
  }
  
  
  //NO SE USA
  async uploadTDDLog(req: Request, res: Response) {
    
    try {

      const getColor = (testEntry: any): string => {
        if (testEntry.numTotalTests === 0) {
          return "red";
        } else if (testEntry.numPassedTests === testEntry.numTotalTests) {
          return "green";
        } else {
          return "red";
        }
      };

      const { repoOwner, repoName, branch = "main", log: tddLog } = req.body;
      if (!repoOwner || !repoName || !tddLog) {
        return res.status(400).json({ error: "Faltan campos requeridos: repoOwner, repoName o log." });
      }
      console.log("Ahora procederé a extraer los datos para insertarlos en la tabla");
      let actualCommitSha = null;
      let lastCommitIndex = 0;
      const commitTimelineEntries = [];
      //itero sobre todos los objetos del tdd log
      for (let i = 0; i < tddLog.length; i++){
        const entry = tddLog[i];
        //chequeamos si el entry es un commit entry
        if(entry.commitId){
          actualCommitSha = entry.commitId;
          //una vez encontrado el entry commit, chequeamos todos los commits anteriores, por lo que por ahora, hacemos otro for
          for(let j = lastCommitIndex; j < i; j++)
          {
            const testEntry = tddLog[j];
            if(testEntry.numPassedTests !== undefined && testEntry.numTotalTests !== undefined && testEntry.timestamp){
              const color = getColor(testEntry);
              const commitTimelineEntry: ITimelineEntry = {
                execution_id: null, 
                commit_sha: actualCommitSha,
                execution_timestamp: new Date(testEntry.timestamp),
                number_of_tests: testEntry.numTotalTests,
                passed_tests: testEntry.numPassedTests,
                color: color,
                repoName,
                repoOwner,
                branch,
                test_id: testEntry.testId == null ? null : Number(testEntry.testId),
                failed_tests: Number(testEntry.failedTests ?? 0),
                success: Boolean(testEntry.success)
              };
              commitTimelineEntries.push(commitTimelineEntry);
            } 
          }
          await this.handleJobConclusionUpdate(
            actualCommitSha,
            repoOwner,
            repoName,
            commitTimelineEntries
          ); 

          const lastExecutionEntry = commitTimelineEntries[commitTimelineEntries.length - 1];
          if (lastExecutionEntry) {
            await this.updateTestCountIfNeeded(
              repoOwner,
              repoName,
              actualCommitSha,
              lastExecutionEntry.number_of_tests
            );
          }
       
          let tdd_cycle_entry="";
          const hasRed = commitTimelineEntries.some(entry => entry.color === "red");
          const lastIsGreen = commitTimelineEntries.length > 0 && commitTimelineEntries[commitTimelineEntries.length - 1].color === "green";
          if (hasRed && lastIsGreen) {
            console.log("Commits con ciclos de TDD rojo - verde");
            tdd_cycle_entry="RojoVerde";
          }
          else if (!lastIsGreen){
            console.log("Commits con ultima ejecucion de pruebas rojo");
            tdd_cycle_entry="Rojo";
          }
          else if(!hasRed){
            console.log(" Commits con ejecucion de pruebas de solo verde");
            tdd_cycle_entry="Verde";
          }
          try{
            await this.dbCommitsRepository.updateTddCycle(actualCommitSha,tdd_cycle_entry); 
          } catch (error) {
            console.error(`Error al actualizar el commit ${actualCommitSha}: ${error}`);
          }
          // despues insertamos en la tabla de commits tabla 
          // Se modificó la tabla en staging
          lastCommitIndex = i + 1;
        }
      }
      console.log("Entradas para registrar en la BD:");
      await this.submitTDDLogToDB.execute(commitTimelineEntries); //anadi esta linea de codigo

      return res.status(200).json({ message: "Archivo TDD log procesado y registros creados", data: commitTimelineEntries });
    } catch (error) {
      console.error("Error al procesar el archivo TDD log:", error);
      return res.status(500).json({ error: "Error al procesar el archivo TDD log" });
    }
  }
  
  // NO SE USA
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
