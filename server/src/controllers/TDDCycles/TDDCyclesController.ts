import { Request, Response } from "express";
import { IDBJobsRepository } from "../../modules/TDDCycles/Domain/IDBJobsRepository";
import { IDBCommitsRepository } from "../../modules/TDDCycles/Domain/IDBCommitsRepository";
import { IGithubRepository } from "../../modules/TDDCycles/Domain/IGithubRepository";
import { CommitsUseCase } from "../../modules/TDDCycles/Application/getTDDCyclesUseCase";
import { GetTestResultsUseCase } from "../../modules/TDDCycles/Application/getTestResultsUseCase";

class TDDCyclesController {
  commitUseCase: CommitsUseCase;
  testResultsUseCase: GetTestResultsUseCase;
  constructor(
    dbCommitRepository: IDBCommitsRepository,
    jobRepository: IDBJobsRepository,
    githubRepository: IGithubRepository
  ) {
    this.commitUseCase = new CommitsUseCase(
      dbCommitRepository,
      githubRepository
    );
    this.testResultsUseCase = new GetTestResultsUseCase(
      jobRepository,
      githubRepository
    );
  }
  async getTDDCycles(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const commits = await this.commitUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(commits);
    } catch (error) {
      console.error("Error getting TDD Cycles:", error);
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
      console.error("Error getting test results:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
export default TDDCyclesController;
