import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Card, CardContent, Typography, Box } from '@mui/material';
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


  const sortedDates = sortedCombinedList.map(([commit]) => {
    const date = new Date(commit.commit.date);
    return date.toLocaleString();
  });

  return (
<div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginBottom: "40px" }}>
  <div style={{ flex: "1", maxWidth: "300px" }}>
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

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {sortedDates.map((date, index) => (
        <Card
          key={index}
          sx={{
            height: '229px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 6px rgba(0, 0, 0, 0.1)',
            mb: 0.5, 
          }}
        >
          <CardContent>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ textAlign: 'center' }}
            >
              {date}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
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

