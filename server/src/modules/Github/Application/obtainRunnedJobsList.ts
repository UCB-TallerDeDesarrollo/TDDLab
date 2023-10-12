
import { GithubAdapter } from "../Repositories/github.API";


export const obtainRunnedJobsList=async(owner: string, repoName: string,Adapter:GithubAdapter=new GithubAdapter())=>{
    
    const githubruns = await Adapter.obtainRunsOfGithubActions(
      owner,
      repoName
    );
    const commitsWithActions: [string,number][] =
      githubruns.data.workflow_runs.map((workFlowRun: any) => {
        return [workFlowRun.head_commit.id,workFlowRun.id];
      });
    return commitsWithActions
  }