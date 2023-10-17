
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";

interface CycleReportViewProps {
  commitsInfo: CommitDataObject[] | null;
  jobsByCommit: JobDataObject [] | null;
}

function TDDCycleList({ commitsInfo,jobsByCommit}: CycleReportViewProps) {
  
  if (commitsInfo === null || jobsByCommit === null) {
    return null;
  }
  const combinedList: [CommitDataObject, JobDataObject|null][] = commitsInfo.map((commit) => {
    const job = jobsByCommit.find((job) => job.sha === commit.sha);
    if (job === undefined) {
      return [commit, null];
    }
    return [commit, job];
  });
  return (
    <>
      {combinedList.map((commit) => (
        <TDDCycleCard key={commit[0].sha} commit={commit[0]} jobs={commit[1]} />
      ))}
    </>
  );
}

export default TDDCycleList;
