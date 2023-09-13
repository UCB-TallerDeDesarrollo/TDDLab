import { Octokit } from "octokit";

export class GithubAdapter{
    octokit:Octokit
    constructor() {
        this.octokit = new Octokit();
      }
    async obtainCommitsOfRepo(owner:string,repoName:string)
    {
        let ans=await this.octokit.request(`GET /repos/${owner}/${repoName}/commits`);
        console.log(ans);
        
    }
}