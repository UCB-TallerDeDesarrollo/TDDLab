import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { JobDataObject } from "../domain/jobInterfaces";
import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface";
import axios from 'axios'; 

export class GithubAPIAdapter implements GithubAPIRepository {
  octokit: Octokit;
  backAPI:string;
  constructor() {
    this.octokit = new Octokit(
      /*{
      auth: 'coloca tu token github para mas requests'
  }*/
  );
  this.backAPI="https://tdd-lab-api-gold.vercel.app/api/TDDCycles"
  }
  
  async obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]> {
    try {
      const response = await axios.get(this.backAPI+`/commits?owner=${owner}&repoName=${repoName}`);
      console.log(this.backAPI+`/commits?owner=${owner}&repoName=${repoName}`);
      
      if (response.status!=200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData:[]=response.data
      const commits: CommitDataObject[] = responseData.map((commitData:any) => ({
        html_url: commitData.html_url,
        sha: commitData.sha,
        stats: {
          total: commitData.total,
          additions: commitData.additions,
          deletions: commitData.deletions,
        },
        commit: {
          date: new Date(commitData.commit_date), // Convert date string to Date object
          message: commitData.message,
          url: commitData.url,
          comment_count: commitData.comment_count,
        },
        coverage: commitData.coverage,
        test_count: commitData.test_count
      }));
      
      return commits;
    } catch (error) {
      // Handle any errors here
      console.error("Error obtaining commits:", error);
      throw error;
    }
  }

  

  async obtainRunsOfGithubActions(owner: string, repoName: string) {
    try {
      const response = await this.octokit.request(
        `GET /repos/${owner}/${repoName}/actions/runs`
      );

      return response;
    } catch (error) {
      // Handle any errors here
      console.error("Error obtaining runs:", error);
      throw error;
    }
  }


  async obtainJobsOfRepo(owner: string, repoName: string): Promise<JobDataObject[]> {
    try {
      const response = await axios.get(`${this.backAPI}/jobs`, {
        params: { owner, repoName }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData=response.data
      const jobs: JobDataObject[] = responseData.map((jobData: any) => ({
        sha: jobData.sha,
        conclusion: jobData.conclusion
      }));

      return jobs;
    } catch (error) {
      console.error("Error obtaining jobs:", error);
      throw error;
    }
  }
}