import { GithubAdapter } from "../../Github/Repositories/github.API";
import { CommitRepository } from "../Repositories/commitRepository";
import { getCommitsAPI, saveCommitsDB } from "./updateCommitsTable";


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
  try{
    if (!repositoryAdapter.repositoryExist(owner, repoName)){
      const commits = await getCommitsAPI(owner, repoName,githubAdapter)
      saveCommitsDB(owner, repoName,commits,repositoryAdapter)
  
    }else {
      const newCommits = await checkForNewCommits(owner, repoName, commitsData);
      const commits = githubAdapter.getCommits
      updateCommitsDB
    }
  }catch(error){
    console.error("Error updating commits table:", error);
    return { error: "Error updating commits table" };
  }finally{
    const Jobs = await repositoryAdapter.getCommits(owner, repoName);
      return Jobs;
  }
};
