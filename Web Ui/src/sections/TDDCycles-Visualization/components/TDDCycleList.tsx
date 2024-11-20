import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

interface CycleReportViewProps {
  commitsInfo: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
}

function TDDCycleList({
  commitsInfo,
  jobsByCommit,
}: Readonly<CycleReportViewProps>) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (commitsInfo === null || jobsByCommit === null) {
    return null;
  }

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const combinedList: [CommitDataObject, JobDataObject | null][] = commitsInfo.map((commit) => {
    const job = jobsByCommit.find((job) => job.sha === commit.sha);
    return [commit, job ?? null];
  });

  const sortedCombinedList = [...combinedList].sort((a, b) => {
    const dateA = new Date(a[0].commit.date).getTime();
    const dateB = new Date(b[0].commit.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginBottom: "40px" }}>
      <div style={{ flex: "1", maxWidth: "300px" }}>
        <button
          onClick={toggleSortOrder}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "-18px",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Fecha <span> {sortOrder === 'asc' ? '↑' : '↓'} </span>
        </button>
      </div>
  
      <div style={{ flex: "1" }}>
 
        {sortedCombinedList.map(([commit, job]) => (
          <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
        ))}
      </div>
    </div>
  );
}

export default TDDCycleList;


