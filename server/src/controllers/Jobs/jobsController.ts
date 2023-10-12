import { Request, Response } from "express";
import { jobRepository } from "../../modules/Jobs/Repositories/jobRepository";
import { getJobs } from "../../modules/Jobs/Application/jobUseCases";
class JobsController {
    repository: jobRepository
  constructor() {
    this.repository=new jobRepository()
  }

  async getJobs(req: Request, res: Response) {
    try {
        const { owner, repoName } = req.query;
        if (!owner || !repoName) {
            return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
        }
        const Jobs = await getJobs(String(owner),String(repoName));
        return res.status(200).json(Jobs);
    } catch (error) {
      console.error("Error fetching Jobs:", error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

}

export default JobsController;
