import { jobRepository } from "../../adapters/dataBaseRepositories/jobRepository";
// import { Job } from "../../domain/models/Job";
import { Request, Response } from 'express';

const Adapter = new jobRepository()

export const getJobs = async (req: Request, res: Response) => {
    try {
        const { owner, repoName } = req.query;
        
        if (!owner || !repoName) {
          return res.status(400).json({ error: 'Bad request, missing owner or repoName' });
        }
    
        const ans = await Adapter.getJobs(String(owner), String(repoName));
        return res.status(200).json(ans);
      } catch (error) {
        return res.status(500).json({ error: 'Server error' });
      }
};

// export const saveJobs = async (req: Request, res: Response) => {
    
//   };
  