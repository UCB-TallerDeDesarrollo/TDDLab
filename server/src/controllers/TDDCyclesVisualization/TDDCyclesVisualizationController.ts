import { Request, Response } from "express";
import { CommitUseCases } from "../../modules/Commits/Application/commitUseCase";
import { GithubUseCases } from "../../modules/Github/Application/githubUseCases";

class TDDCyclesVisualizationController {
  commitUseCases: CommitUseCases;
  githubUseCases: GithubUseCases;
  constructor(repository) {
    this.githubUseCases = new GithubUseCases();
    this.commitUseCases = new CommitUseCases(
      this.repository,
      this.githubUseCases
    );
  }
  async getCommits(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const commits = await this.commitUseCases.getCommits(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(commits);
    } catch (error) {
      console.error("Error fetching commits:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
export default TDDCyclesVisualizationController;
