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
    <>
      {/* Título interactivo */}
      <div
        onClick={toggleSortOrder}
        style={{
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '20px',
          textDecoration: 'underline',
        }}
      >
        Fecha ({sortOrder === 'asc' ? 'Ascendente' : 'Descendente'})
      </div>

      {/* Tabla con las fechas */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              Fechas Ordenadas
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lista ordenada */}
      {sortedCombinedList.map(([commit, job]) => (
        <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
      ))}
    </>
  );
}

export default TDDCycleList;
