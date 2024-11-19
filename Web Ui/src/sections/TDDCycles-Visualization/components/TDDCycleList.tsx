import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Card, CardContent, Typography, Box } from '@mui/material';

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
        <div
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
          Fecha
          <span>
            {sortOrder === 'asc' ? '↑' : '↓'} 
          </span>
        </div>
  
     
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedDates.map((date, index) => (
            <Card 
              key={index} 
              style={{ 
                boxShadow: '0 5px 6px rgba(0, 0, 0, 0.1)', 
                height: '295px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',  
                alignItems: 'center',        
              }}
            >
              <CardContent style={{ textAlign: 'center' }}>  
                <Typography variant="body2" color="textSecondary">
                  {date}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </div>
  
      <div style={{ flex: "1" }}>
        {/* Lista ordenada */}
        {sortedCombinedList.map(([commit, job]) => (
          <TDDCycleCard key={commit.sha} commit={commit} jobs={job} />
        ))}
      </div>
    </div>
  );
}

export default TDDCycleList;
