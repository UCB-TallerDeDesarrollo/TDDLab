import  { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

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

  const handleSortOrderChange = (event: SelectChangeEvent<'asc' | 'desc'>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
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
    <>
      <FormControl variant="outlined" style={{ minWidth: 200, marginBottom: 20 }}>
        <InputLabel>Ordenar por Fecha</InputLabel>
        <Select
          value={sortOrder}
          onChange={handleSortOrderChange}
          label="Ordenar por Fecha"
        >
          <MenuItem value="asc">Ascendente</MenuItem>
          <MenuItem value="desc">Descendente</MenuItem>
        </Select>
      </FormControl>
      {sortedCombinedList.map(([commit, job]) => (
        <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
      ))}
    </>
  );
}

export default TDDCycleList;