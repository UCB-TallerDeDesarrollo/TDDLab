import { Request, Response } from 'express';
import { CommitRepository } from '../../modules/Commits/Repositories/commitRepository';
import { getCommits } from '../../modules/Commits/Application/getCommits';

class CommitsController {
    repository: CommitRepository;
    constructor() {
        this.repository = new CommitRepository();
    }
    async getCommits(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
            }
            const commits = await getCommits(String(owner), String(repoName));
            return res.status(200).json(commits);
        } catch (error) {
            console.error("Error fetching commits:", error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
export default CommitsController;