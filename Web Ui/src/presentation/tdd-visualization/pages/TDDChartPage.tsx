import React from "react";
import { useEffect, useRef, useState } from "react";
import { PropagateLoader } from "react-spinners";
import TDDCharts from "../components/TDDChart";
import BranchHistoryChart from "../components/BranchHistoryChart";

import "../styles/TDDChartPageStyles.css";
import { useTDDChartPage } from "../hooks/useTDDChartPage";
import { CycleReportViewProps } from "../types/tddVisualization.types";

function TDDChartPage(props: Readonly<CycleReportViewProps>) {
  const tddPage = useTDDChartPage(props);
  const { chartsState } = tddPage;
  const [showTestCountChart, setShowTestCountChart] = useState(false);
  const testCountChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTestCountChart && testCountChartRef.current) {
      testCountChartRef.current.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [showTestCountChart]);

  return (
    <div className="container">
      <h1 data-testid="repoNameTitle">Tarea: {tddPage.repoName}</h1>
      {!tddPage.isStudent && (
        <h1 data-testid="repoOwnerTitle">Autor: {tddPage.ownerName}</h1>
      )}

      {tddPage.loading && (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {!tddPage.loading && !chartsState.commitsInfo?.length && (
        <div className="error-message" data-testid="errorMessage">
          Error: Verifica que el repositorio utilice la rama "main". Actualmente,
          TDDLab no puede cargar los datos si la rama principal es "master"
        </div>
      )}

      {!tddPage.loading && !!chartsState.commitsInfo?.length && (
        <React.Fragment>
          {!tddPage.isStudent && (
            <div className="navigation-buttons">
              <button
                data-testid="previous-student"
                className="nav-button"
                onClick={tddPage.goToPreviousStudent}
                disabled={tddPage.currentIndex === 0}
                style={{
                  backgroundColor:
                    tddPage.currentIndex === 0 ? "#B0B0B0" : "#052845",
                }}
              >
                Anterior
              </button>

              <button
                data-testid="next-student"
                className="nav-button"
                onClick={tddPage.goToNextStudent}
                disabled={
                  tddPage.currentIndex === tddPage.fetchedSubmissions.length - 1
                }
                style={{
                  backgroundColor:
                    tddPage.currentIndex === tddPage.fetchedSubmissions.length - 1
                      ? "#B0B0B0"
                      : "#052845",
                }}
              >
                Siguiente
              </button>
            </div>
          )}

          <div className="mainInfoContainer">
            <TDDCharts
              data-testId="cycle-chart"
              commits={chartsState.commitsInfo}
              tddLogs={chartsState.tddLogsInfo}
              commitsTddCycles={chartsState.commitsTddCycles}
              port={props.port}
              role={props.role}
              metric={chartsState.metric}
              setMetric={chartsState.setMetric}
              typegraphs={props.graphs}
            />
          </div>
        </React.Fragment>
      )}

      {!tddPage.loading && !!chartsState.commitsInfo?.length && props.graphs === "graph" && (
        <React.Fragment>
          <button
            type="button"
            aria-expanded={showTestCountChart}
            aria-controls="total-test-count-chart"
            onClick={() => setShowTestCountChart(true)}
            style={{
              margin: "16px auto",
              border: 0,
              borderRadius: 8,
              padding: "12px 20px",
              background: "#2563EB",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ver gráfica: Total Número de Tests
          </button>
          <div id="total-test-count-chart" ref={testCountChartRef} style={{ width: "100%" }}>
            {showTestCountChart && (
              <BranchHistoryChart
                  history={{
                    repository: { provider: "github", owner: "mock", name: "mock" },
                    branches: [
                      {
                        repository: { provider: "github", owner: "mock", name: "mock" },
                        branch: "main",
                        commits: [
                          { sha: "1111111", parentShas: [], message: "Crear implementación inicial", committedAt: new Date("2024-01-01"), stats: { additions: 10, deletions: 5, total: 15 }, metrics: { executionEventId: null, numPassedTests: 2, failedTests: 0, numTotalTests: 2, coveragePercentage: 80, conclusion: "success" } },
                          { sha: "3333333", parentShas: [], message: "Agregar escenario de rama-b", committedAt: new Date("2024-01-03"), stats: { additions: 5, deletions: 2, total: 7 }, metrics: { executionEventId: null, numPassedTests: 4, failedTests: 0, numTotalTests: 4, coveragePercentage: 90, conclusion: "success" } },
                        ],
                        executions: [],
                      },
                      {
                        repository: { provider: "github", owner: "mock", name: "mock" },
                        branch: "rama-a",
                        commits: [
                          { sha: "1111111", parentShas: [], message: "Crear implementación inicial", committedAt: new Date("2024-01-01"), stats: { additions: 10, deletions: 5, total: 15 }, metrics: { executionEventId: null, numPassedTests: 2, failedTests: 0, numTotalTests: 2, coveragePercentage: 80, conclusion: "success" } },
                          { sha: "2222222", parentShas: [], message: "Agregar escenario de rama-a", committedAt: new Date("2024-01-02"), stats: { additions: 8, deletions: 3, total: 11 }, metrics: { executionEventId: null, numPassedTests: 3, failedTests: 0, numTotalTests: 3, coveragePercentage: 85, conclusion: "success" } },
                        ],
                        executions: [],
                      },
                      {
                        repository: { provider: "github", owner: "mock", name: "mock" },
                        branch: "rama-b",
                        commits: [
                          { sha: "1111111", parentShas: [], message: "Crear implementación inicial", committedAt: new Date("2024-01-01"), stats: { additions: 10, deletions: 5, total: 15 }, metrics: { executionEventId: null, numPassedTests: 2, failedTests: 0, numTotalTests: 2, coveragePercentage: 80, conclusion: "success" } },
                          { sha: "3333333", parentShas: [], message: "Agregar escenario de rama-b", committedAt: new Date("2024-01-03"), stats: { additions: 5, deletions: 2, total: 7 }, metrics: { executionEventId: null, numPassedTests: 4, failedTests: 0, numTotalTests: 4, coveragePercentage: 90, conclusion: "success" } },
                        ],
                        executions: [],
                      },
                    ],
                  }}
                />
            )}
          </div>
        </React.Fragment>
      )}

      {props.role !== "student" && (
        <div className="feedback-container">
          <h2 className="comments-title">Escribe un comentario:</h2>
          <textarea
            id="feedback"
            value={tddPage.feedback}
            onChange={(event) => tddPage.setFeedback(event.target.value)}
            placeholder="Ingrese su retroalimentación aquí"
          />
          <button onClick={tddPage.handleSubmitFeedback} disabled={tddPage.isSubmitting}>
            {tddPage.isSubmitting ? (
              <PropagateLoader color="#fff" size={5} />
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      )}

      {!tddPage.loading && tddPage.comments && tddPage.comments.length > 0 && (
        <div className="comments-section">
          <h2 className="comments-title">Comentarios</h2>
          <div className="comments-list">
            {tddPage.comments.map((comment) => (
              <div key={`${comment.teacher_id}-${comment.created_at}`} className="comment-card">
                <div className="comment-header">
                  <strong className="comment-author">
                    {tddPage.emails[comment.teacher_id] || "Cargando..."}
                  </strong>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="comment-body">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TDDChartPage;
