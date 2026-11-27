import React from "react";
import { PropagateLoader } from "react-spinners";
import TDDCharts from "../components/TDDChart";
import "../styles/TDDChartPageStyles.css";
import { useTDDChartPage } from "../hooks/useTDDChartPage";
import { CycleReportViewProps } from "../types/tddVisualization.types";

function TDDChartPage(props: Readonly<CycleReportViewProps>) {
  const tddPage = useTDDChartPage(props);
  const { chartsState } = tddPage;

  return (
    <div className="container">
      <h1 data-testid="repoNameTitle">Tarea: {tddPage.repoName}</h1>
      {!tddPage.isStudent && (
        <h1 data-testid="repoOwnerTitle">Autor: {tddPage.ownerName}</h1>
      )}

      {chartsState.branches.length > 0 && (
        <div className="branch-selector-container">
          <label htmlFor="branch-selector">Rama</label>
          <select
            id="branch-selector"
            data-testid="branch-selector"
            value={tddPage.chartsState.selectedBranch}
            onChange={(event) => tddPage.selectBranch(event.target.value)}
            disabled={tddPage.chartsState.branches.length === 0}
          >
            {tddPage.chartsState.branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}{branch.isDefault ? " (predeterminada)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {tddPage.loading && (
        <div className="mainInfoContainer" role="status" aria-label="Cargando datos del repositorio">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {!tddPage.loading && tddPage.dataError && (
        <div className="error-message" role="alert" data-testid="errorMessage">
          No se pudieron cargar los datos del repositorio. Inténtalo de nuevo más tarde.
        </div>
      )}

      {!tddPage.loading && !tddPage.dataError && !chartsState.commitsInfo?.length && (
        <div className="empty-message" role="status" data-testid="emptyMessage">
          No hay commits disponibles para este repositorio.
        </div>
      )}

      {!tddPage.loading && !!chartsState.commitsInfo?.length && (
        <React.Fragment>
          <p className="selected-branch" data-testid="selected-branch">
            Mostrando datos de la rama: <strong>{chartsState.selectedBranch}</strong>
          </p>
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
