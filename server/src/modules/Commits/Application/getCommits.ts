import { CommitRepository } from "../Repositories/commitRepository";
import { updateCommitsTable } from "./updateCommitsTable";

export const getCommits = async (
  owner: string,
  repoName: string,
  Adapter: CommitRepository = new CommitRepository()
) => {
  console.log("getCommits");
  await updateCommitsTable(owner, repoName, Adapter);
  console.log("getCommits2");
  const Jobs = await Adapter.getCommits(owner, repoName);
  return Jobs;
};
