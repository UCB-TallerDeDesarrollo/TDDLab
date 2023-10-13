import { CommitRepository } from "../Repositories/commitRepository";


export const getCommits = async (owner: string, repoName: string,Adapter:CommitRepository=new CommitRepository()) => {
  const Jobs = await Adapter.getCommits(owner, repoName);
  return Jobs
};