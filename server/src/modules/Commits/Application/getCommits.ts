import { GithubAdapter } from "../../Github/Repositories/github.API";
import { CommitRepository } from "../Repositories/commitRepository";
import { updateCommitsTable } from "./updateCommitsTable";


// export const getCommits = async (
//   owner: string,
//   repoName: string,
//   repositoryAdapter: CommitRepository,
//   githubAdapter: GithubAdapter
// ) => {
//   try {
//     await updateCommitsTable(owner, repoName, repositoryAdapter, githubAdapter);
//   } catch (error) {
//     console.error("Error updating commits table:", error);
//     return { error: "Error updating commits table" };
//   } finally {
//     const Jobs = await repositoryAdapter.getCommits(owner, repoName);
//     return Jobs;
//   }
// };


export const getCommits = async (
  owner: string,
  repoName: string,
  repositoryAdapter: CommitRepository,
  githubAdapter: GithubAdapter
) => {
  ()
  if (!repositoryExistDB(owner, repo)){
    const commits = githubAdapter.getCommits
    repositoryAdapter.saveCommitInfo(commits)

  }else {
    const commits = githubAdapter.getCommits
    updateCommitsDB
  }
  const Jobs = await repositoryAdapter.getCommits(owner, repoName);
    return Jobs;
};
