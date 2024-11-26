import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { Card, CardContent, Typography } from "@mui/material";
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
      <a
        href={commit.html_url}
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
      : "no se encontró cobertura";
    const testCountText = commit.test_count
      ? `${commit.test_count}`
      : "no se encontraron tests";

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

  function renderDateCard() {
    const date = new Date(commit.commit.date).toLocaleString("es-ES", {
      hour12: false, // Desactiva el formato de 12 horas
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  
    return (
      <Card
        className="dateCard"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          boxShadow: "0 1px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent style={{ textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            {date}
          </Typography>
        </CardContent>
      </Card>
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
      {renderDateCard()} 
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
    </div>
  );
  
}

export default TDDCycleCard;