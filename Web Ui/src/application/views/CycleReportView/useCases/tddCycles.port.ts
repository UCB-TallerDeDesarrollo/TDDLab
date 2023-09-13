import { GithubAdapter } from "../../../../repositories/github.API";
import { CommitDataObject } from "../../../../domain/models/githubInterfaces";

export class TDDCyclesPort {
  adapter:GithubAdapter
  constructor(){
    this.adapter=new GithubAdapter()

  }

  async obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]> {
    return await this.adapter.obtainCommitsOfRepo(owner, repoName);
  }
}
