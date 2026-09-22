import { PropagateLoader } from "react-spinners";
import TDDCharts from "../components/TDDChart";
import "../styles/TDDChartPageStyles.css";
import { useTDDChartPage } from "../hooks/useTDDChartPage";
import {
  CycleReportViewProps,
  TDDChartsState,
} from "../types/tddVisualization.types";

type VisualizationStatus =
  | "loading"
  | "commits-error"
  | "tests-error"
  | "missing-tests"
  | "ready";

function getVisualizationStatus(
  loading: boolean,
  chartsState: TDDChartsState,
): VisualizationStatus {
  if (loading) {
    return "loading";
  }

  if (chartsState.commitsLoadError || !chartsState.commitsInfo?.length) {
    return "commits-error";
  }

  if (chartsState.testDataLoadError) {
    return "tests-error";
  }

  if (!chartsState.tddLogsInfo?.length) {
    return "missing-tests";
  }

  return "ready";
}

function TDDChartPage(props: Readonly<CycleReportViewProps>) {
  const tddPage = useTDDChartPage(props);
  const { chartsState } = tddPage;
  const visualizationStatus = getVisualizationStatus(tddPage.loading, chartsState);
  const hasCommits = (chartsState.commitsInfo?.length ?? 0) > 0;
  const canNavigateStudents = !tddPage.loading && hasCommits && !tddPage.isStudent;

  return (
    <div className="container">
      <h1 data-testid="repoNameTitle">Tarea: {tddPage.repoName}</h1>
      {!tddPage.isStudent && (
        <h1 data-testid="repoOwnerTitle">Autor: {tddPage.ownerName}</h1>
      )}

      {visualizationStatus === "loading" && (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {visualizationStatus === "commits-error" && (
        <div className="error-message" data-testid="errorMessage">
          Hubo un problema al cargar los commits del repositorio
        </div>
      )}

      {visualizationStatus === "tests-error" && (
        <div className="error-message" data-testid="errorMessage">
          No se pudieron cargar los datos de las pruebas.
        </div>
      )}

      {visualizationStatus === "missing-tests" && (
        <div className="error-message" data-testid="errorMessage">
          No se encontraron datos de pruebas en la rama principal{" "}
          {chartsState.defaultBranch ?? "desconocida"}. Verifica que el repositorio tenga pruebas
          configuradas y que hayan sido ejecutadas.
        </div>
      )}

      {canNavigateStudents && (
        <div className="navigation-buttons">
          <button
            data-testid="previous-student"
            className="nav-button"
            onClick={tddPage.goToPreviousStudent}
            disabled={tddPage.currentIndex === 0}
            style={{
              backgroundColor: tddPage.currentIndex === 0 ? "#B0B0B0" : "#052845",
            }}
          >
            Anterior
          </button>
          <button
            data-testid="next-student"
            className="nav-button"
            onClick={tddPage.goToNextStudent}
            disabled={tddPage.currentIndex === tddPage.fetchedSubmissions.length - 1}
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

      {visualizationStatus === "ready" && (
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
          />
        </div>
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
