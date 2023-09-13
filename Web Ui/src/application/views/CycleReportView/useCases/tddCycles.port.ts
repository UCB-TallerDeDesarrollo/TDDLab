import { GithubAdapter } from "../../../../repositories/github.API";


export class TDDCyclesPort {
  adapter:GithubAdapter
  constructor(){
    this.adapter=new GithubAdapter()

  }

  async obtainCommitsOfRepo(owner:string,repoName:string) {
    return await this.adapter.obtainCommitsOfRepo(owner,repoName)

  }
}
