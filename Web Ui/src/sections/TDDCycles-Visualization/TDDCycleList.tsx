import { useEffect, useState } from "react";
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject, CommitInformationDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";

interface CycleReportViewProps {
  commitsInfo: CommitInformationDataObject[] | null;
  jobsByCommit: Record<string, JobDataObject> | null;
}

function TDDCycleList({ commitsInfo,jobsByCommit }: CycleReportViewProps) {
  const repoOwner = "DwijanX";
  const repoName = "Bulls-and-Cows";

  return (
    <>
      <h1>Repository: {repoName}</h1>
      {jobsByCommit != null && commitsInfo != null && commitsInfo.map((commit) => (
        <TDDCycleCard key={commit.sha} commit={commit} jobs={jobsByCommit[commit.sha]} />
      ))}
    </>
  );
}

export default TDDCycleList;
