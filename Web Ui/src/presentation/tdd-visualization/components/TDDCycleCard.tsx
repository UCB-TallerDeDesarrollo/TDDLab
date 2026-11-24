import type { ReactNode } from 'react';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { TDDCommitDate, TDDCommitHeading, TDDCommitLink } from "./TDDCommitMeta";
import { Check, Close, Remove } from "@mui/icons-material";
import "../styles/fonts.css";

interface CycleReportViewProps {
  commit: CommitDataObject;
  history?: ReactNode;
  timestamp?: number;
  commitNumber?: number;
}

const results = {
  success: { label: "Exitoso", Icon: Check },
  failure: { label: "Fallido", Icon: Close },
  neutral: { label: "Sin resultado", Icon: Remove },
};

function TDDCycleCard({ commit, history, timestamp, commitNumber }: Readonly<CycleReportViewProps>) {
  function getCommitStats() {
    const coverageText = commit.coverage == null ? "Sin datos" : `${commit.coverage}%`;
    const testCountText = `${commit.test_count}`;

    return (
      <div className="commit-stats">
        <div className="commit-stat-item">
          <div className="circle total" data-testid="total"></div>
          <span>Total de modificaciones:</span> {commit.stats.total}
        </div>
        <div className="commit-stat-item">
          <div className="circle additions" data-testid="addition"></div>
          <span>Adiciones:</span> {commit.stats.additions}
        </div>
        <div className="commit-stat-item">
          <div className="circle deletions" data-testid="deletion"></div>
          <span>Sustracciones:</span> {commit.stats.deletions}
        </div>
        <div className="commit-stat-item">
          <div className="circle coverage" data-testid="coverage"></div>
          <span>Cobertura:</span> {coverageText}
        </div>
        <div className="commit-stat-item">
          <div className="circle test-count" data-testid="test-count"></div>
          <span>Número de Tests:</span> {testCountText}
        </div>
      </div>
    );
  }

  function getCommitStatus() {
    const { conclusion, test_count } = commit;
    const result = test_count > 0 && (conclusion === "success" || conclusion === "failure")
      ? conclusion
      : "neutral";
    const { label, Icon } = results[result];

    return (
      <div className={`commit-result commit-result--${result}`}>
        <Icon />
        {label}
      </div>
    );
  }

  return (
    <div
      className="cycleCardWrapper"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: "16px",
      }}
    >
      <TDDCommitDate date={timestamp ?? commit.commit.date} />
      <div className="cycleCardContainer">
        <div className={history ? "tdd-history-card-title" : "commit-card-title"}>
          <TDDCommitHeading message={commit.commit.message} sha={commit.sha} commitNumber={commitNumber}>{history}</TDDCommitHeading>
          <div className="commit-result-line">{getCommitStatus()}</div>
        </div>
        {getCommitStats()}

        <div className="commit-actions"><TDDCommitLink href={commit.html_url} /></div>
      </div>
    </div>
  );
}

export default TDDCycleCard;
