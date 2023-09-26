import { useEffect, useState } from "react";
import { TDDCyclesPort } from "../useCases/tddCycles.port";
import CycleCard from "./CycleCard";
import { JobDataObject } from "../../../../domain/models/jobInterfaces";
import { CommitDataObject, CommitInformationDataObject } from "../../../../domain/models/githubCommitInterfaces";

interface CycleReportViewProps {
  port: TDDCyclesPort | any;
}

function CycleReportView({ port }: CycleReportViewProps) {
  const repoOwner = "bmb0";
  const repoName = "pacman-calidad-software";

  const [commits, setCommits] = useState<CommitDataObject[] | null>(null);
  const [commitsInfo, setCommitsInfo] = useState<CommitInformationDataObject[] | null>(null);
  const [jobsByCommit, setJobsByCommit] = useState<Record<string, JobDataObject> | null>(null);

  const obtainJobsData = async () => {
    try {
      const jobsData: Record<string, JobDataObject> = await port.obtainJobsData(repoOwner, repoName);
      setJobsByCommit(jobsData);
    } catch (error) {
      console.error('Error obtaining jobs:', error);
    }
  };

  const obtainCommitsData = async () => {
    try {
      const commitsData = await port.obtainCommitsOfRepo(repoOwner, repoName);
      setCommits(commitsData);
    } catch (error) {
      console.error('Error obtaining commits:', error);
    }
  };

  const obtainCommitsInfoData = async (commits: CommitDataObject[] | null) => {
    if (commits) {
      const commitsInfoData = await Promise.all(
        commits.map((commit) => port.obtainCommitInformation(repoOwner, repoName, commit.sha))
      );
      setCommitsInfo(commitsInfoData);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await obtainJobsData();
      await obtainCommitsData();
      // await obtainCommitsInfoData(commits);
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>Repository: {repoName}</h1>
      {jobsByCommit != null && commits != null && commits.map((commit) => (
        <CycleCard key={commit.sha} commit={commit} jobs={jobsByCommit[commit.sha]} />
      ))}
    </>
  );
}

export default CycleReportView;
