import { Request, Response } from 'express';
import { CommitRepository } from '../../modules/Commits/Repositories/commitRepository';
import { CommitUseCases } from '../../modules/Commits/Application/getCommits';
import { GithubUseCases } from '../../modules/Github/Application/githubUseCases';

class CommitsController {
    commitUseCases: CommitUseCases;
    repository: CommitRepository;
    githubUseCases: GithubUseCases;
    constructor() {
        this.repository = new CommitRepository();
        this.githubUseCases = new GithubUseCases();
        this.commitUseCases = new CommitUseCases(this.repository, this.githubUseCases);
    }
    async getCommits(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
            }
            const commits = await this.commitUseCases.getCommits(String(owner), String(repoName));
            return res.status(200).json(commits);
        } catch (error) {
            console.error("Error fetching commits:", error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
export default CommitsController;