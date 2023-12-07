import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import "../styles/TDDCycleCard.css";
import "../styles/fonts.css";
interface CycleReportViewProps {
  commit: CommitDataObject;
  jobs: JobDataObject | null;
}

function TDDCycleCard({ commit, jobs }: CycleReportViewProps) {
  const getBoxStyle = (conclusion: string) => {
    if (conclusion === "success") {
      return { backgroundColor: "green"};
    } else {
      return { backgroundColor: "red"};
    }
  };
  const traduceConclusion = (conclusion: string) => {
      if (conclusion === "success") {
        return "exito";
      } else {
        return "fallido";
      }
  };

  function getCommitLink() {
    const htmlUrl = commit.html_url;
    return (
      <a
        href={htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="commit-link"
      >
        Ver commit
      </a>
    );
  }

  function getCommitStats() {
    const coverageText = commit.coverage
      ? `${commit.coverage}%`
      : "no se encontró cobertura"; // Establece un valor predeterminado

    return (
      <div className="commit-stats">
  <div className="commit-stat-item">
    <div className="circle total" data-testid="total"></div>
    <span>Total de modificaciones:</span> {commit.stats.total}
  </div>
  <div className="commit-stat-item">
    <div className="circle additions" data-testid="adition"></div>
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
</div>
    );
  }

  return (
    <div className="cycleCardContainer">
      <span className="title">Commit {commit.commit.message}</span>
      {getCommitStats()}
      {jobs != null && (
        <div className={"conclusionBox"} style={getBoxStyle(jobs.conclusion)}>
          Acciones: {traduceConclusion(jobs.conclusion)}
        </div>
      )}
      {jobs == null && (
        <div className={"conclusionBox noActionsBox"}>
          No se encontraron acciones
        </div>
      )}
      {getCommitLink()}
      <br />
    </div>
  );
}

export default TDDCycleCard;





