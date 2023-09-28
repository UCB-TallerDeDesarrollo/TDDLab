import { useEffect, useState } from "react";
import { TDDCyclesPort } from "../useCases/tddCycles.port";
import { JobDataObject } from "../../../../domain/models/jobInterfaces";
import { CommitDataObject, CommitInformationDataObject } from "../../../../domain/models/githubCommitInterfaces";
import Charts from "./Charts";

interface CycleReportViewProps {
  port: TDDCyclesPort | any;
}

function ChartsView({ port }: CycleReportViewProps) {
  const repoOwner = "DwijanX";
  const repoName = "Bulls-and-Cows";

  const [commitsInfo, setCommitsInfo] = useState<CommitInformationDataObject[] | null>(null);
  const [jobsByCommit, setJobsByCommit] = useState<Record<string, JobDataObject> | null>(null);

  const obtainJobsData = async () => {
    try {
      console.log("Fetching commits data...");
      const jobsData: Record<string, JobDataObject> = await port.obtainJobsData(repoOwner, repoName);
      setJobsByCommit(jobsData);
    } catch (error) {
      console.error('Error obtaining jobs:', error);
    }
  };

  const obtainCommitsData = async () => {
    console.log("Fetching commit information...");
    try {
      const commits: CommitDataObject[] = await port.obtainCommitsOfRepo(repoOwner, repoName);
      if (commits) {
        console.log("Fetching commit information...");
        const commitsInfoData: CommitInformationDataObject[] = await Promise.all(
          commits.map((commit) => port.obtainCommitInformation(repoOwner, repoName, commit.sha))
        );
        setCommitsInfo(commitsInfoData);
      }
    } catch (error) {
      console.error('Error obtaining commit information:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await obtainJobsData();
      await obtainCommitsData();
    };
    fetchData();
  }, []);

  console.log("Commits Info:", commitsInfo);
  return Charts(commitsInfo,jobsByCommit);
}

export default ChartsView;