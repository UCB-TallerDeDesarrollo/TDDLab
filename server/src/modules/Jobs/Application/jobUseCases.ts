import { jobRepository } from "../Repositories/jobRepository";
// import { Job } from "../../domain/models/Job";


export const getJobs = async (owner: string, repoName: string,Adapter:jobRepository=new jobRepository()) => {
  const ans = await Adapter.getJobs(owner, repoName);
  return ans
};

// export const saveJobs = async (req: Request, res: Response) => {
    
//   };
  