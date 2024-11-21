import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { JobDataObject } from "../domain/jobInterfaces";
import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface";
import { formatDate } from '../application/GetTDDCycles';
import axios from "axios";
import { VITE_API } from "../../../../config.ts";

export class GithubAPIAdapter implements GithubAPIRepository {
  octokit: Octokit;
  backAPI: string;
  
  constructor() {
    this.octokit = new Octokit();
    //auth: 'coloca tu token github para mas requests'
    this.backAPI = VITE_API + "/TDDCycles"; // https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/
  }

  async obtainUserName(owner: string): Promise<string> {
    try {
      const response = await this.octokit.request(`GET /users/${owner}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const userName = response.data.name;
      return userName || owner; // Retorna el nombre o un mensaje si no está disponible
    } catch (error) {
      console.error("Error obtaining user name:", error);
      throw error;
    }
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]> {
    try {
      const response = await axios.get(
        this.backAPI + `/commits?owner=${owner}&repoName=${repoName}`,
      );
      console.log(
        this.backAPI + `/commits?owner=${owner}&repoName=${repoName}`,
      );

      if (response.status != 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData: [] = response.data;
      const commits: CommitDataObject[] = responseData.map(
        (commitData: any) => ({
          html_url: commitData.html_url,
          sha: commitData.sha,
          stats: {
            total: commitData.total,
            additions: commitData.additions,
            deletions: commitData.deletions,
            date: formatDate(new Date(commitData.commit_date))
          },
          commit: {
            date: new Date(commitData.commit_date), // Convert date string to Date object
            message: commitData.message,
            url: commitData.url,
            comment_count: commitData.comment_count,
          },
          coverage: commitData.coverage,
          test_count: commitData.test_count,
        }),
      );
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
        `GET /repos/${owner}/${repoName}/actions/runs`,
      );

      return response;
    } catch (error) {
      // Handle any errors here
      console.error("Error obtaining runs:", error);
      throw error;
    }
  }

  async obtainComplexityOfRepo(owner: string, repoName: string) {
    try {
      const repoUrl = `https://github.com/${owner}/${repoName}`;
    
      const response = await axios.post('https://api-ccn.vercel.app/analyze', { repoUrl });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = response.data;
      const jobs: JobDataObject[] = responseData.map((jobData: any) => ({
        sha: jobData.sha,
        conclusion: jobData.conclusion,
      }));

      return jobs;
    } catch (error) {
      console.error("Error obtaining jobs:", error);
      throw error;
    }
  }
  
  async obtainJobsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<JobDataObject[]> {
    try {
      const response = await axios.get(`${this.backAPI}/jobs`, {
        params: { owner, repoName },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = response.data;
      const jobs: JobDataObject[] = responseData.map((jobData: any) => ({
        sha: jobData.sha,
        conclusion: jobData.conclusion,
      }));

      return jobs;
    } catch (error) {
      console.error("Error obtaining jobs:", error);
      throw error;
    }
  }
}
