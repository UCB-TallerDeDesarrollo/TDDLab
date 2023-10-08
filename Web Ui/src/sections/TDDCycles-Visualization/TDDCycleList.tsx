
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
  const combinedList: [CommitDataObject, JobDataObject][] = [];


  if (commitsInfo.length === jobsByCommit.length) {
    for (let i = 0; i < commitsInfo.length; i++) {
      const commit = commitsInfo[i];
      const job = jobsByCommit[i];
      combinedList.push([commit, job]);
    }
  } else {
    console.error('Las listas no tienen la misma longitud');
  }
  return (
    <>
      {combinedList.map((commit) => (
        <TDDCycleCard key={commit[0].sha} commit={commit[0]} jobs={commit[1]} />
      ))}
    </>
  );
}

export default TDDCycleList;
