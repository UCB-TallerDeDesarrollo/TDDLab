import { Request, Response } from 'express';
import { JobRepository } from '../../modules/TDDCycles/Repositories/TDDCyclesJobsRepository';
import { CommitRepository } from '../../modules/TDDCycles/Repositories/TDDCyclesCommitsRepository';
import { GithubRepository } from '../../modules/TDDCycles/Repositories/TDDCyclesGithubRepository';
import { CommitsUseCase } from '../../modules/TDDCycles/Application/getCommitsUseCase';
import { JobsUseCase } from '../../modules/TDDCycles/Application/getJobsUseCase';
import { GithubUseCases } from '../../modules/Github/Application/githubUseCases';

class TDDCyclesController {
    commitUseCase: CommitsUseCase;
    JobsUseCase: JobsUseCase;
    githubUseCases: GithubUseCases;
    constructor(commitRepository: CommitRepository, jobRepository: JobRepository, githubRepository: GithubRepository) {
        this.githubUseCases = new GithubUseCases();
        this.commitUseCase = new CommitsUseCase(commitRepository, githubRepository);
        this.JobsUseCase = new JobsUseCase(jobRepository, githubRepository)
    }
    async getTDDCycles(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
            }
            const commits = await this.commitUseCase.execute(String(owner), String(repoName));
            return res.status(200).json(commits);
        } catch (error) {
            console.error("Error fetching commits:", error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    async getTestOutcomes(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
            }
            const Jobs = await this.JobsUseCase.execute(String(owner), String(repoName));
            return res.status(200).json(Jobs);
        } catch (error) {
            console.error("Error fetching Jobs:", error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
export default TDDCyclesController;