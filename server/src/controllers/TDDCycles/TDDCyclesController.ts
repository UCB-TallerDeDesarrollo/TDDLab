import { Request, Response } from "express";
import { JobRepository } from "../../modules/TDDCycles/Repositories/TDDCyclesJobsRepository";
import { DBCommitRepository } from "../../modules/TDDCycles/Repositories/DBCommitsRepository";
import { GithubRepository } from "../../modules/TDDCycles/Repositories/TDDCyclesGithubRepository";
import { CommitsUseCase } from "../../modules/TDDCycles/Application/getCommitsUseCase";
import { TestResultsUseCase } from "../../modules/TDDCycles/Application/getTestResultsUseCase";

class TDDCyclesController {
  commitUseCase: CommitsUseCase;
  testResultsUseCase: TestResultsUseCase;
  constructor(
    dbCommitRepository: DBCommitRepository,
    jobRepository: JobRepository,
    githubRepository: GithubRepository
  ) {
    this.commitUseCase = new CommitsUseCase(
      dbCommitRepository,
      githubRepository
    );
    this.testResultsUseCase = new TestResultsUseCase(
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
      console.error("Error fetching commits:", error);
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
