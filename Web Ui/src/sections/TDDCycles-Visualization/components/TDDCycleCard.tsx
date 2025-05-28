import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { Card, CardContent, Typography } from "@mui/material";
import "../styles/TDDCycleCard.css";
import "../styles/fonts.css";

interface CycleReportViewProps {
  commit: CommitDataObject;
}

function TDDCycleCard({ commit }: Readonly<CycleReportViewProps>) {
  function getCommitLink() {
    return (
      <a
        href={commit.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '16px 28px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '16px'
        }}
      >
        Ver commit
      </a>
    );
  }

  function getCommitStats() {
    const coverageText = commit.coverage
      ? `${commit.coverage}%`
      : "Sin cobertura";
    const testCountText = commit.test_count
      ? `${commit.test_count}`
      : "Sin tests";

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
    let testCount = commit.test_count || 0;
    let conclusion = commit.conclusion || "failure";
    let isSuccessful = testCount > 0 && conclusion === "success";

    return (
      <div
        style={{
          backgroundColor: isSuccessful ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '16px 28px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px'
        }}
      >
        <span style={{ marginRight: '8px' }}>{isSuccessful ? '✔️' : '❌'}</span>
        {isSuccessful ? 'Resultado: Exitoso' : 'Resultado: Fallido'}
      </div>
    );
  }

  function renderDateCard() {
    const date = new Date(commit.commit.date).toLocaleString("es-ES", {
      hour12: false,
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
        <span className="title">Commit: {commit.commit.message}</span>
        {getCommitStats()}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
          {getCommitStatus()}
          {getCommitLink()}
        </div>
      </div>
    </div>
  );
}

export default TDDCycleCard;