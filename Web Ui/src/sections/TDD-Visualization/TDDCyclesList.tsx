import { useEffect, useState } from "react";
import { GetTDDCycles } from "../../TDD-Visualization/application/GetTDDCycles";
import { GithubAPIAdapter } from "../../TDD-Visualization/repositories/GithubAPIAdapter";
import { CommitDataObject } from "../../TDD-Visualization/domain/models/githubCommitInterfaces";
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../TDD-Visualization/domain/models/jobInterfaces";
interface CycleReportViewProps {
  port: GithubAPIAdapter | any;
}
function TDDCyclesList({ port }: CycleReportViewProps) {
  const [commits, setCommits] = useState<CommitDataObject[]>();
  const [jobsByCommit, setJobsByCommit] =
    useState<Record<string, JobDataObject>>();

  const repoOwner = "DwijanX";
  const repoName = "Bulls-and-Cows";

  const getTDDCycles = new GetTDDCycles(port);

  const obtainJobsData = async () => {
    const jobsData: Record<string, JobDataObject> =
      await getTDDCycles.obtainJobsData(repoOwner, repoName);
    setJobsByCommit(jobsData);
  };
  const obtainCommitsData = async () => {
    const commitsData = await getTDDCycles.obtainCommitsOfRepo(
      repoOwner,
      repoName
    );
    setCommits(commitsData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await obtainJobsData();
        await obtainCommitsData();
      } catch (error) {
        console.error("Error obtaining commits:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <h1>Repository:{repoName} </h1>
      {jobsByCommit != null &&
        commits != null &&
        commits.map((commit) => (
          <TDDCycleCard
            key={commit.sha}
            commit={commit}
            jobs={jobsByCommit[commit.sha]}
          ></TDDCycleCard>
        ))}
    </>
  );
}

export default TDDCyclesList;
