import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Box, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

interface CycleReportViewProps {
  commitsInfo: CommitDataObject[] | null;
}

function TDDCycleList({ commitsInfo }: Readonly<CycleReportViewProps>) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (commitsInfo === null) {
    return null;
  }

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const sortedCommits = [...commitsInfo].sort((a, b) => {
    const dateA = new Date(a.commit.date).getTime();
    const dateB = new Date(b.commit.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <>
      <div style={{ flex: "1", maxWidth: "30px", marginLeft: "20px" }}>
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
      <div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginBottom: "40px", marginRight: "59px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", margin: "0 auto", width: "100vw" }}>
          {sortedCommits.map((commit) => (
            <TDDCycleCard key={commit.sha} commit={commit} />
          ))}
        </div>
      </div>
    </>
  );
}

export default TDDCycleList;
