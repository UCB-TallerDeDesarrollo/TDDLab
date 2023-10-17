import { Request, Response } from 'express';
import { CommitRepository } from '../../modules/Commits/Repositories/commitRepository';
import { getCommits } from '../../modules/Commits/Application/getCommits';
import { GithubAdapter } from '../../modules/Github/Repositories/github.API';

class CommitsController {
    repository: CommitRepository;
    github: GithubAdapter;
    constructor() {
        this.repository = new CommitRepository();
        this.github = new GithubAdapter();
    }
    async getCommits(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
            }
            const commits = await getCommits(String(owner), String(repoName), this.repository, this.github);
            return res.status(200).json(commits);
        } catch (error) {
            console.error("Error fetching commits:", error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
export default CommitsController;