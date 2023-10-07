
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitInformationDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";

interface CycleReportViewProps {
  commitsInfo: CommitInformationDataObject[] | null;
  jobsByCommit: Record<string, JobDataObject> | null;
}

function TDDCycleList({ commitsInfo,jobsByCommit }: CycleReportViewProps) {
  return (
    <>
      {jobsByCommit != null && commitsInfo != null && commitsInfo.map((commit) => (
        <TDDCycleCard key={commit.sha} commit={commit} jobs={jobsByCommit[commit.sha]} />
      ))}
    </>
  );
}

export default TDDCycleList;
