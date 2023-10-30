import { Request, Response } from "express";
import { jobRepository } from "../../modules/Jobs/Repositories/jobRepository";
import { JobsUseCase } from "../../modules/Jobs/Application/jobsUseCase";
class JobsController {
  JobsUseCase: JobsUseCase
  repository: jobRepository
  constructor() {
    this.repository=new jobRepository()
    this.JobsUseCase=new JobsUseCase(this.repository)
  }

  async getJobs(req: Request, res: Response) {
    try {
        const { owner, repoName } = req.query;
        if (!owner || !repoName) {
            return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
        }
        const Jobs = await this.JobsUseCase.getJobs(String(owner),String(repoName));
        return res.status(200).json(Jobs);
    } catch (error) {
      console.error("Error fetching Jobs:", error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

}

export default JobsController;
