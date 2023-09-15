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

  useEffect(() => {
    const APICalls = async () => {
      try {
        const jobsData:Record<string, JobDataObject> = await port.obtainJobsData(repoOwner, repoName);
        const commitsData = await port.obtainCommitsOfRepo(repoOwner, repoName);
        console.log(commitsData);
        
        setJobsByCommit(jobsData);
        setCommits(commitsData);
      } catch (error) {
        console.error('Error obtaining commits:', error);
      }
    };

    APICalls();
  }, []);
  return (
    <>
      <h1>Repository:{repoName} </h1>
      {jobsByCommit != null && commits && commits.map((commit) => (
        <CycleCard key={commit.sha} commit={commit} jobs={jobsByCommit[commit.sha]}></CycleCard>
      ))}
    </>
  );
}

export default CycleReportView;
