import { JobDataObject } from "../Domain/jobInterfaces";
import { GithubAdapter } from "../Repositories/github.API";



export const obtainJobsData=async(owner: string, repoName: string,listOfCommitsWithActions: [string,number][],Adapter:GithubAdapter=new GithubAdapter())=>{

    const jobs: Record<string, JobDataObject> = {};
    await Promise.all(
        listOfCommitsWithActions.map(async (workflowInfo) => {
        const jobInfo = await Adapter.obtainJobsOfACommit(
          owner,
          repoName,
          workflowInfo[1],
          1
        );
        jobs[workflowInfo[0]] = jobInfo;
      })
    );
    return jobs
  }