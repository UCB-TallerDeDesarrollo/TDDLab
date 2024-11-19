import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";

import "../styles/TDDCycleCard.css";
import "../styles/fonts.css";

interface CycleReportViewProps {
  commit: CommitDataObject;
  jobs: JobDataObject | null;
}

function TDDCycleCard({ commit, jobs }: Readonly<CycleReportViewProps>) {
  const getBoxStyle = (conclusion: string) => {
    return conclusion === "success" ? { backgroundColor: "green" } : { backgroundColor: "red" };
  };

  const traduceConclusion = (conclusion: string) => {
    return conclusion === "success" ? "exito" : "fallido";
  };

  function getCommitLink() {
    return (
      <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="commit-link">
        Ver commit
      </a>
    );
  }

  function getCommitStats() {
    const coverageText = commit.coverage ? `${commit.coverage}%` : "no se encontró cobertura";
    const testCountText = commit.test_count ? `${commit.test_count}` : "no se encontraron tests";

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

  return (
    <div className="cycleCardContainer">
      <span className="title">Commit {commit.commit.message}</span>
      {getCommitStats()}
      {jobs ? (
        <div className="conclusionBox" style={getBoxStyle(jobs.conclusion)}>
          Acciones: {traduceConclusion(jobs.conclusion)}
        </div>
      ) : (
        <div className="conclusionBox noActionsBox">
          No se encontraron acciones
        </div>
      )}
      {getCommitLink()}
    </div>
  );
}

export default TDDCycleCard;
