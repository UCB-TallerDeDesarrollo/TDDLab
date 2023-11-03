import { obtainJobsData } from "../../Github/Application/obtainJobs";
import { obtainRunnedJobsList } from "../../Github/Application/obtainRunnedJobsList";
import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { GithubAdapter } from "../../Github/Repositories/github.API";
import { JobDB } from "../Domain/Job";
import { jobRepository } from "../Repositories/jobRepository";


const checkForNewJobs = async (owner: string, repoName: string,listOfCommitsWithActions:[string,number ][],jobsAdapterDb:jobRepository=new jobRepository()) => {
    let jobsToAdd=[]

    for(const element of listOfCommitsWithActions)
    {
        let currentJob=element     
        let row=await jobsAdapterDb.checkIfJobExistsInDb(owner,repoName,currentJob[1])
        if(row.length!=0)
            break
        else
            jobsToAdd.push(currentJob)
    }
    return jobsToAdd;
  };
  
const addJobsToDb = async (owner: string, repoName: string,jobs:Record<string, JobDataObject>,jobsAdapterDb:jobRepository=new jobRepository) => {
    let jobsFormatted:JobDB[]=[]
    for (const key in jobs) {
        jobsFormatted.push({id:jobs[key].jobs[0].run_id,sha:jobs[key].jobs[0].head_sha,owner:owner,reponame:repoName,conclusion:jobs[key].jobs[0].conclusion})
      }
    jobsAdapterDb.insertRecordsIntoDatabase(jobsFormatted)
  };
  

export const updateJobsTable = async (owner: string, repoName: string,jobsAdapterDb:jobRepository=new jobRepository()) => {
  let githubAdapter=new GithubAdapter()

  
  let listOfCommitsWithActions:[string,number ][] = await obtainRunnedJobsList(owner,repoName,githubAdapter) //[commitSha,workflowId][]
  let jobsToAdd:[string,number][]=await checkForNewJobs(owner,repoName,listOfCommitsWithActions)
  if(jobsToAdd.length>0)
  {
    console.log(jobsToAdd);
    let jobs:Record<string, JobDataObject>=await obtainJobsData(owner,repoName,jobsToAdd,githubAdapter);
    await addJobsToDb(owner,repoName,jobs,jobsAdapterDb)
  }
  

};


  