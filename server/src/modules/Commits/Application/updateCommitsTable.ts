import { GithubAdapter } from "../../Github/Repositories/github.API";
import { CommitDataObject } from "../Domain/CommitDataObject";
import { CommitRepository } from "../Repositories/commitRepository";

export const checkForNewCommits = async (   //cambio de nombre
  owner: string,
  repoName: string,
  commitsData: CommitDataObject[],
  githubAdapter: CommitRepository = new CommitRepository()
) => {
  let commitsToAdd = [];

  for (let index = 0; index < commitsData.length; index++) {
    let currentCommit = commitsData[index];
    let row = await githubAdapter.commitExists(
      owner,
      repoName,
      currentCommit.sha
    );
    if (row.length != 0) {
      break;
    } else {
      commitsToAdd.push(currentCommit);
    }
  }
  return commitsToAdd;
};

export const getCommitsAPI = async (
  owner: string,
  repoName: string,
  githubAdapter: GithubAdapter,
) => {
  try{
    const commits = await githubAdapter.obtainCommitsOfRepo(owner, repoName);
    const commitsFromSha = await Promise.all(
      commits.map((commit: any) => {
        return githubAdapter.obtainCommitsFromSha(owner, repoName, commit.sha);
      })
    );
    const commitsData: CommitDataObject[] = commitsFromSha.map(
      (commit: any) => {
        return {
          html_url: commit.html_url,
          stats: {
            total: commit.stats.total,
            additions: commit.stats.additions,
            deletions: commit.stats.deletions,
          },
          commit: {
            date: commit.commit.author.date,
            message: commit.commit.message,
            url: commit.commit.url,
            comment_count: commit.commit.comment_count,
          },
          sha: commit.sha,
        };
      }
    );
    return commitsData
  } catch (error) {
    console.error("Error en la obtención de commits:", error);
    throw { error: "Error en la obtención de commits" };
  }
}
export const saveCommitsDB = async (
  owner: string,
  repoName: string,
  newCommits: CommitDataObject[],
  repositoryAdapter: CommitRepository
): Promise<void> => {
  try {
    if (newCommits.length > 0) {
      await Promise.all(
        newCommits.map(async (commit: CommitDataObject) => {
          !(await repositoryAdapter.saveCommitInfoOfRepo(owner, repoName, commit));
        })
      );
    }
  } catch (error) {
    console.error("Error en la actualización de la tabla de commits:", error);
  }
};
