import { CommitRepository } from "../Repositories/TDDCycleCommitsRepository";
import { CommitDataObject } from "../../Github/Domain/commitInterfaces";
import { CommitDTO } from "../Domain/CommitDataObject";
import { GithubUseCases } from "../../Github/Application/githubUseCases";
export class CommitsUseCase {
    private repositoryAdapter: CommitRepository;
    private githubUseCases: GithubUseCases;

    constructor(
        repositoryAdapter: CommitRepository,
        githubUseCases: GithubUseCases
    ) {
        this.repositoryAdapter = repositoryAdapter;
        this.githubUseCases = githubUseCases;
    }
    async execute(owner: string, repoName: string) {
        let commits;
        try {
            if (!(await this.repositoryAdapter.repositoryExist(owner, repoName))) {
                const commits = await this.getCommitsFromGithub(owner, repoName);
                const commitsFromSha =
                    await this.getCommitsShaFromGithub(owner, repoName, commits);
                await this.saveCommitsToDB(owner, repoName, commitsFromSha);
            } else {
                const commits = await this.getCommitsFromGithub(owner, repoName); //getCommitsAPI should be changed to getLastCommits once it is implemented
                const newCommits = await this.checkNewCommits(owner, repoName, commits);
                const commitsFromSha = await this.getCommitsShaFromGithub(owner, repoName, newCommits);
                await this.saveCommitsToDB(owner, repoName, commitsFromSha);
            }
            commits = await this.repositoryAdapter.getCommits(owner, repoName);
        } catch (error) {
            console.error("Error updating commits table:", error);
            throw error;
        }
        return commits;
    }
    async checkNewCommits(
        owner: string,
        repoName: string,
        commitsData: CommitDataObject[]
    ) {
        let commitsToAdd = [];
        for (const currentCommit of commitsData) {
            let row = await this.repositoryAdapter.commitExists(owner, repoName, currentCommit.sha);
            if (row.length != 0) {
                break;
            } else {
                commitsToAdd.push(currentCommit);
            }
        }
        return commitsToAdd;
    }

    async getCommitsFromGithub(owner: string, repoName: string) {
        try {
            const commits = await this.githubUseCases.obtainCommitsOfRepo(owner, repoName);
            return commits;
        } catch (error) {
            console.error("Error en la obtención de commits:", error);
            throw new Error("Error en la obtención de commits");
        }
    }
    async getCommitsShaFromGithub(
        owner: string,
        repoName: string,
        commits: CommitDataObject[]
    ) {
        try {
            const commitsFromSha = await Promise.all(
                commits.map((commit: any) => {
                    return this.githubUseCases.obtainCommitsFromSha(owner, repoName, commit.sha);
                })
            );
            const commitsData: CommitDTO[] = commitsFromSha.map((commit: any) => {
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
                    coverage: commit.coveragePercentage,
                };
            });
            return commitsData;
        } catch (error) {
            console.error("Error getting commits from SHA:", error);
            throw new Error("Error getting commits from SHA");
        }
    }

    async saveCommitsToDB(
        owner: string,
        repoName: string,
        newCommits: CommitDTO[]
    ) {
        try {
            if (newCommits.length > 0) {
                await Promise.all(
                    newCommits.map(async (commit: CommitDTO) => {
                        await this.repositoryAdapter.saveCommitInfoOfRepo(owner, repoName, commit);
                    })
                );
            }
        } catch (error) {
            console.error("Error updating the commit table in the database:", error);
        }
    }
}









