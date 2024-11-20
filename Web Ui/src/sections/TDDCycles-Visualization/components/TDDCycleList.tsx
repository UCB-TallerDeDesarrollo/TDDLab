import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Box, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

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
    <>
    <div style={{ flex: "1", maxWidth: "300px", marginLeft:"20px" }}>
    <Box
      onClick={toggleSortOrder}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'pointer',
        mb: 1,
      }}
    >
      <Typography variant="body1" fontWeight="bold">
        Fecha
      </Typography>
      {sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </Box>

      </div>
    <div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginBottom: "40px", marginRight:"59px" }}>
      
  
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",margin:"0 auto",width:"100vw" }} >
 
        {sortedCombinedList.map(([commit, job]) => (
          <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
        ))}
      </div>
    </div>
    </>
  );
}

export default TDDCycleList;


