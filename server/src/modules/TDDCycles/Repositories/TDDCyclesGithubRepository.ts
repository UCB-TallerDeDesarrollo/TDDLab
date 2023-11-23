import { Octokit } from "octokit";
import { IGithubRepository } from "../Domain/IGithubRepository";
import {
  CommitDataObject,
  CommitInformationDataObject,
} from "../Domain/commitInterfaces";
import dotenv from "dotenv"; // Import 'dotenv' as a module
dotenv.config();
export class GithubRepository implements IGithubRepository{
  octokit: Octokit;
  constructor() {
    const { REACT_APP_AUTH_TOKEN } = process.env;
    this.octokit = new Octokit({ auth: REACT_APP_AUTH_TOKEN });
  }
  async getCommits(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]> {
    try {
      //Show the rate limit remaining for the token used to make the request
      const rate_limit = await this.octokit.request("GET /rate_limit");
      console.log("Rate Limit Remaining:", rate_limit.data.rate.remaining);


      const response: any = await Promise.race([
        this.octokit.request(`GET /repos/${owner}/${repoName}/commits`, {
          per_page: 100,
        }),
        this.timeout(10000),
      ]);

      const commits: CommitDataObject[] = response.data.map(
        (githubCommit: any) => {
          return {
            sha: githubCommit.sha,
            node_id: githubCommit.node_id,
            url: githubCommit.url,
            html_url: githubCommit.html_url,
            comments_url: githubCommit.comments_url,
            author: githubCommit.author
              ? {
                  login: githubCommit.author.login,
                  id: githubCommit.author.id,
                  node_id: githubCommit.author.node_id,
                  avatar_url: githubCommit.author.avatar_url,
                  gravatar_id: githubCommit.author.gravatar_id,
                  url: githubCommit.author.url,
                  html_url: githubCommit.author.html_url,
                  followers_url: githubCommit.author.followers_url,
                  following_url: githubCommit.author.following_url,
                  gists_url: githubCommit.author.gists_url,
                  starred_url: githubCommit.author.starred_url,
                  subscriptions_url: githubCommit.author.subscriptions_url,
                  organizations_url: githubCommit.author.organizations_url,
                  repos_url: githubCommit.author.repos_url,
                  events_url: githubCommit.author.events_url,
                  received_events_url: githubCommit.author.received_events_url,
                  type: githubCommit.author.type,
                  site_admin: githubCommit.author.site_admin,
                }
              : null,
            committer: githubCommit.committer
              ? {
                  login: githubCommit.committer.login,
                  id: githubCommit.committer.id,
                  node_id: githubCommit.committer.node_id,
                  avatar_url: githubCommit.committer.avatar_url,
                  gravatar_id: githubCommit.committer.gravatar_id,
                  url: githubCommit.committer.url,
                  html_url: githubCommit.committer.html_url,
                  followers_url: githubCommit.committer.followers_url,
                  following_url: githubCommit.committer.following_url,
                  gists_url: githubCommit.committer.gists_url,
                  starred_url: githubCommit.committer.starred_url,
                  subscriptions_url: githubCommit.committer.subscriptions_url,
                  organizations_url: githubCommit.committer.organizations_url,
                  repos_url: githubCommit.committer.repos_url,
                  events_url: githubCommit.committer.events_url,
                  received_events_url:
                    githubCommit.committer.received_events_url,
                  type: githubCommit.committer.type,
                  site_admin: githubCommit.committer.site_admin,
                }
              : null,
            parents: githubCommit.parents.map((parent: any) => {
              return {
                sha: parent.sha,
                url: parent.url,
                html_url: parent.html_url,
              };
            }),
            commit: {
              author: {
                name: githubCommit.commit.author.name,
                email: githubCommit.commit.author.email,
                date: new Date(githubCommit.commit.author.date),
              },
              committer: {
                name: githubCommit.commit.committer.name,
                email: githubCommit.commit.committer.email,
                date: new Date(githubCommit.commit.committer.date),
              },
              message: githubCommit.commit.message,
              tree: {
                sha: githubCommit.commit.tree.sha,
                url: githubCommit.commit.tree.url,
              },
              url: githubCommit.commit.url,
              comment_count: githubCommit.commit.comment_count,
              verification: {
                verified: githubCommit.commit.verification.verified,
                reason: githubCommit.commit.verification.reason,
                signature: githubCommit.commit.verification.signature,
                payload: githubCommit.commit.verification.payload,
              },
            },
          };
        }
      );

      return commits;
    } catch (error) {
      // Handle any errors here
      console.error("Error obtaining commits:", error);
      throw error;
    }
  }

  async getCommitInfoForTDDCycle(
    owner: string,
    repoName: string,
    sha: string
  ): Promise<CommitInformationDataObject> {
    try {
      const response: any = await Promise.race([
        this.octokit.request(`GET /repos/${owner}/${repoName}/commits/${sha}`),
        this.timeout(10000),
      ]);

      const coverageResponse: any = await Promise.race([
        this.octokit.request(
          `GET /repos/${owner}/${repoName}/commits/${sha}/comments`
        ),
        this.timeout(10000),
      ]);

      let percentageMatch;

      if (coverageResponse.data.length > 0) {
        percentageMatch = /Statements\s*\|\s*([\d.]+)%/.exec(
          coverageResponse.data[0].body
        );
        if (percentageMatch) {
          percentageMatch = String(percentageMatch[1]);
        }
      } else {
        percentageMatch = "";
      }

      const commitInfo: CommitInformationDataObject = {
        ...response.data,
        coveragePercentage: percentageMatch,
      };
      return commitInfo;
    } catch (error) {
      console.error("Error obtaining commits:", error);
      throw error;
    }
  }

  timeout(ms: number): Promise<void> {
    return new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, ms);
    });
  }
  async obtainRunsOfGithubActions(owner: string, repoName: string) {
    try {
        const response : any = await Promise.race([
            this.octokit.request(`GET /repos/${owner}/${repoName}/actions/runs`),
            this.timeout(10000),
        ]);

        return response;
    } catch (error) {
        console.error("Error obtaining runs:", error);
        throw error;
    }
}
  async obtainJobsOfACommit(
    owner: string,
    repoName: string,
    jobId: number,
    attempt: number
  ) {
    try {
      const { data: { total_count, jobs } } = await this.octokit.request(
        `GET /repos/${owner}/${repoName}/actions/runs/${jobId}/attempts/${attempt}/jobs`
      );

      const jobData = {
        total_count,
        jobs,
      };

      return jobData;
    } catch (error) {
      console.error("Error obtaining job:", error);
      throw error;
    }
  }
}
