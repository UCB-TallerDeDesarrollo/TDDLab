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

  // Alterna entre ascendente y descendente
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

  // Extrae las fechas ordenadas
  const sortedDates = sortedCombinedList.map(([commit]) => {
    const date = new Date(commit.commit.date);
    return date.toLocaleString(); // Convierte a formato legible
  });

  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "flex-start" }}>
      <div style={{ flex: "1", maxWidth: "300px" }}>
        {/* Título interactivo */}
        <div
          onClick={toggleSortOrder}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "-15px",
            textDecoration: "underline",
            textAlign: "center",
          }}
        >
          Fecha 
        </div>
  
        {/* Tabla con las fechas */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr>
              {/* <th
                style={{
                  backgroundColor: "#f4f4f4",
                  border: "1px solid #ddd",
                  padding: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Fechas Ordenadas
              </th> */}
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor:  "white",
                }}
              >
                <td
                  style={{
                    border: "8px solid transparent",
                    padding: "8px",
                    textAlign: "left",
                    height: "300px",
                  }}
                >
                  {date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div style={{ flex: "2" }}>
        {/* Lista ordenada */}
        {sortedCombinedList.map(([commit, job]) => (
          <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
        ))}
      </div>
    </div>
  );
  
  
}

export default TDDCycleList;
