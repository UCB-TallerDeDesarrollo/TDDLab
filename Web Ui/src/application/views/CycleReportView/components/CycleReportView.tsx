import {useEffect,useState} from "react"
import { TDDCyclesPort } from "../useCases/tddCycles.port";
import { CommitDataObject } from "../../../../domain/models/githubCommitInterfaces";
import CycleCard from "./CycleCard";
import { JobDataObject } from "../../../../domain/models/jobInterfaces";
interface CycleReportViewProps {
  port: TDDCyclesPort|any;
}
function CycleReportView({ port }: CycleReportViewProps) {
  const [commits, setCommits] = useState<CommitDataObject[] >();
  const [jobsByCommit, setJobsByCommit] = useState<Record<string, JobDataObject> >();

  const repoOwner = "DwijanX";
  const repoName = "Bulls-and-Cows";

  const obtainJobsData=async()=>{
    const jobsData:Record<string, JobDataObject> = await port.obtainJobsData(repoOwner, repoName);
    setJobsByCommit(jobsData);
  }

  const obtainCommitsData=async()=>{
    const commitsData = await port.obtainCommitsOfRepo(repoOwner, repoName);
    setCommits(commitsData); 
  }

  useEffect(() => {
    const fetchData=async ()=>{
      try {
        await obtainJobsData()
        console.log("TDD: "+jobsByCommit)
        await obtainCommitsData()
        console.log("TDD: "+commits)
      } catch (error) {
        console.error('Error obtaining commits:', error);
      }
    }
    fetchData()
  }, []);
  return (
    <>
      <h1>Repository:{repoName} </h1>
      {jobsByCommit != null && commits!=null && commits.map((commit) => (
        <CycleCard key={commit.sha} commit={commit} jobs={jobsByCommit[commit.sha]}></CycleCard>
      ))}
    </>
  );
}

export default CycleReportView;
