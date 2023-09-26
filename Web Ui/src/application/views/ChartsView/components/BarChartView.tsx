import {useEffect,useState} from "react"
import { TDDCyclesPort } from "../../CycleReportView/useCases/tddCycles.port";
import { CommitDataObject } from "../../../../domain/models/githubCommitInterfaces";
import { JobDataObject } from "../../../../domain/models/jobInterfaces";
import BarsChart from "./BarChart";

interface CycleChartViewProps {
  port: TDDCyclesPort|any;
}

function CycleBarView({ port }: CycleChartViewProps) {
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
        await obtainCommitsData()
      } catch (error) {
        console.error('Error obtaining commits:', error);
      }
    }
    fetchData()
  }, []);
  
  return BarsChart(commits,jobsByCommit);
}

export default CycleBarView;
