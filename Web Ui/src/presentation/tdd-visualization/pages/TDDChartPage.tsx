import React from "react";
import { useEffect, useRef, useState } from "react";
import { PropagateLoader } from "react-spinners";
import TDDCharts from "../components/TDDChart";
import BranchHistoryChart from "../components/BranchHistoryChart";
import type { BranchHistories, BranchHistory } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

import "../styles/TDDChartPageStyles.css";
import { useTDDChartPage } from "../hooks/useTDDChartPage";
import { CycleReportViewProps } from "../types/tddVisualization.types";

const BL02_DEMO_REPOSITORY = {
  owner: "equipo-tddlab",
  repoName: "ejemplo-sprint4",
};
const BL02_DEMO_BRANCHES = ["main", "rama-a", "rama-b"];

function isBL02DemoRepository(owner: string, repoName: string) {
  return owner.toLowerCase() === BL02_DEMO_REPOSITORY.owner &&
    repoName.toLowerCase() === BL02_DEMO_REPOSITORY.repoName;
}

type BranchHistoryLoadState =
  | { status: "idle" | "loading" }
  | { status: "empty"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; history: BranchHistories };

function hasTestResults(branches: BranchHistory[]) {
  const executions = branches.flatMap(branch => branch.executions);
  return branches.some(branch => branch.commits.some(commit =>
    commit.metrics?.numTotalTests != null || executions.some(execution =>
      execution.associatedCommitSha === commit.sha && execution.numTotalTests != null,
    ),
  ));
}

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "response" in error &&
    typeof error.response === "object" && error.response !== null &&
    "status" in error.response && error.response.status === 404;
}

function TDDChartPage(props: Readonly<CycleReportViewProps>) {
  const tddPage = useTDDChartPage(props);
  const { chartsState } = tddPage;
  const usesBL02DemoRepository = isBL02DemoRepository(tddPage.repoOwner, tddPage.repoName);
  const [showTestCountChart, setShowTestCountChart] = useState(usesBL02DemoRepository);
  const [branchHistoryState, setBranchHistoryState] = useState<BranchHistoryLoadState>({ status: "idle" });
  const testCountChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowTestCountChart(usesBL02DemoRepository);
  }, [usesBL02DemoRepository]);

  useEffect(() => {
    if (showTestCountChart && testCountChartRef.current) {
      testCountChartRef.current.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [showTestCountChart]);

  useEffect(() => {
    if (!showTestCountChart) return;

    let active = true;
    setBranchHistoryState({ status: "loading" });

    if (!usesBL02DemoRepository) {
      setBranchHistoryState({
        status: "empty",
        message: "No hay historial TDD disponible para este repositorio.",
      });
      return () => { active = false; };
    }

    const branchHistoryPort = props.branchHistoryPort;
    if (!branchHistoryPort) {
      setBranchHistoryState({
        status: "error",
        message: "No está configurado el adaptador del historial de ramas.",
      });
      return () => { active = false; };
    }

    Promise.all(BL02_DEMO_BRANCHES.map(branch =>
      branchHistoryPort.obtainBranchHistory(tddPage.repoOwner, tddPage.repoName, branch),
    )).then((branches: BranchHistory[]) => {
      if (!active) return;
      if (!branches.some(branch => branch.commits.length > 0)) {
        setBranchHistoryState({
          status: "empty",
          message: "No hay historial TDD disponible para este repositorio.",
        });
        return;
      }
      if (!hasTestResults(branches)) {
        setBranchHistoryState({
          status: "empty",
          message: "No hay resultados de pruebas asociados a los commits de este repositorio.",
        });
        return;
      }

      setBranchHistoryState({
        status: "ready",
        history: { repository: branches[0].repository, branches },
      });
    }).catch((error: unknown) => {
      if (!active) return;
      if (isNotFoundError(error)) {
        setBranchHistoryState({
          status: "empty",
          message: "No hay historial TDD disponible para este repositorio.",
        });
        return;
      }
      setBranchHistoryState({
        status: "error",
        message: error instanceof Error
          ? `No se pudo cargar el historial TDD: ${error.message}`
          : "No se pudo cargar el historial TDD.",
      });
    });

    return () => { active = false; };
  }, [props.branchHistoryPort, showTestCountChart, tddPage.repoName, tddPage.repoOwner, usesBL02DemoRepository]);

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

      {!tddPage.loading && !chartsState.commitsInfo?.length && !usesBL02DemoRepository && (
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

      {props.graphs === "graph" && (
        <React.Fragment>
          {!usesBL02DemoRepository && (
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
          )}
          <div id="total-test-count-chart" ref={testCountChartRef} style={{ width: "80%" }}>
            {branchHistoryState.status === "loading" && (
              <div role="status" style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <PropagateLoader color="#36d7b7" />
              </div>
            )}
            {branchHistoryState.status === "empty" && (
              <p role="status" style={{ textAlign: "center", padding: 16 }}>
                {branchHistoryState.message}
              </p>
            )}
            {branchHistoryState.status === "error" && (
              <p role="alert" style={{ textAlign: "center", padding: 16 }}>
                {branchHistoryState.message}
              </p>
            )}
            {branchHistoryState.status === "ready" && (
              <BranchHistoryChart history={branchHistoryState.history} />
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
