import { useState } from 'react';
import TDDCycleCard from "./TDDCycleCard";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Box, Typography } from '@mui/material';
import type { GitGraphCommit } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { TDDCommitDate, TDDCommitHeading, TDDCommitLink } from "./TDDCommitMeta";
import { getCommitNumbers } from "../../../modules/TDDCycles-Visualization/domain/commitNumbers";
import { getCommitBranches, layoutCommits, TDDCommitLanes } from './TDDCommitLanes';
import '../styles/TDDCommitHistory.css';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

interface CycleReportViewProps {
  commitsInfo: CommitDataObject[] | null;
  gitGraph?: GitGraphCommit[];
  repoUrl?: string;
}

function TDDCycleList({ commitsInfo, gitGraph, repoUrl }: Readonly<CycleReportViewProps>) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedBranch, setSelectedBranch] = useState('');

  if (commitsInfo === null) {
    return null;
  }

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const ascending = sortOrder === 'asc';
  const commitNumbers = getCommitNumbers(commitsInfo, gitGraph);
  const sortedCommits = [...commitsInfo].sort((a, b) => {
    const difference = (commitNumbers.get(a.sha) ?? 0) - (commitNumbers.get(b.sha) ?? 0);
    return ascending ? difference : -difference;
  });

  const history = gitGraph?.length ? layoutCommits(gitGraph) : undefined;
  const branches = [...new Set(gitGraph?.flatMap(getCommitBranches))].sort((a, b) => a.localeCompare(b));
  const branch = branches.includes(selectedBranch) ? selectedBranch : '';
  const commitBySha = new Map(commitsInfo.map((commit) => [commit.sha, commit]));
  const topologyShas = new Set(gitGraph?.map(({ sha }) => sha));
  const remainingCommits = sortedCommits.filter(({ sha }) => !topologyShas.has(sha));
  const historyRows = history && (ascending ? [...history.rows].reverse() : history.rows);

  return (
    <>
      <div className="commit-list-heading">
        <Box
          component="button"
          type="button"
          aria-label={ascending ? 'Mostrar commits más recientes primero' : 'Mostrar commits más antiguos primero'}
          onClick={toggleSortOrder}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            border: 0,
            background: 'none',
            color: 'inherit',
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            Fecha
          </Typography>
          {sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </Box>
        <span>Hora de Bolivia (UTC−4)</span>
        {branches.length > 1 && (
          <label className="commit-branch-filter">
            Resaltar rama
            <select value={branch} onChange={(event) => setSelectedBranch(event.target.value)}>
              <option value="">Todas</option>
              {branches.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        )}
      </div>
      {history && historyRows ? (
        <ol className="tdd-commit-history" aria-label="Historial de commits">
          {ascending && remainingCommits.map((commit) => (
            <li key={commit.sha}><TDDCycleCard commit={commit} commitNumber={commitNumbers.get(commit.sha)} /></li>
          ))}
          {historyRows.map((row) => {
            const { sha, subject, parents, timestamp, body } = row.commit;
            const commit = commitBySha.get(sha);
            const details = (
              <>
                {parents.length > 1 && <strong>Merge</strong>}
                {history.forks.has(sha) && <strong>Bifurcación</strong>}
              </>
            );
            return (
              <li key={sha} className="tdd-commit-history-row" style={{
                gridTemplateColumns: `${history.width}px minmax(0, 1fr)`,
                minWidth: `calc(${history.width}px + var(--commit-history-card-min))`,
              }} data-commit={sha} data-branch-highlighted={branch && getCommitBranches(row.commit).includes(branch) ? 'true' : undefined}>
                <TDDCommitLanes row={row} width={history.width} reverse={ascending} />
                {commit ? <TDDCycleCard commit={commit} history={details} timestamp={timestamp} commitNumber={commitNumbers.get(sha)} /> : (
                  <div className="cycleCardWrapper tdd-history-unmeasured-row">
                    <TDDCommitDate date={timestamp} />
                    <div className="tdd-history-unmeasured">
                      <div className="commit-card-title">
                        <TDDCommitHeading message={body ? `${subject}\n\n${body}` : subject} sha={sha} commitNumber={commitNumbers.get(sha)}>
                          {details}
                        </TDDCommitHeading>
                      </div>
                      <p>Sin métricas registradas</p>
                      {repoUrl && <TDDCommitLink href={`${repoUrl}/commit/${encodeURIComponent(sha)}`} />}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {!ascending && remainingCommits.map((commit) => (
            <li key={commit.sha}><TDDCycleCard commit={commit} commitNumber={commitNumbers.get(commit.sha)} /></li>
          ))}
        </ol>
      ) : (
        <ol className="tdd-commit-history" aria-label="Historial de commits">
          {sortedCommits.map((commit) => (
            <li key={commit.sha}><TDDCycleCard commit={commit} commitNumber={commitNumbers.get(commit.sha)} /></li>
          ))}
        </ol>
      )}
    </>
  );
}

export default TDDCycleList;
