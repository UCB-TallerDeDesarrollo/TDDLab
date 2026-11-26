
import { PropagateLoader } from "react-spinners";

import TDDCharts from "../components/TDDChart";
import BranchSelector from "../components/BranchSelector";

import "../styles/TDDChartPageStyles.css";

import { useTDDChartPage } from "../hooks/useTDDChartPage";

import type {
  CycleReportViewProps,
} from "../types/tddVisualization.types";

import type {
  CommitHistoryRepositoryBranchSupport,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterfaceBranchSupport";

type BranchAwarePageProps = CycleReportViewProps & {
  branchPort?: CommitHistoryRepositoryBranchSupport;
};

function TDDChartPage(
  props: Readonly<BranchAwarePageProps>
) {
  const page = useTDDChartPage(props);
  const { chartsState } = page;

  const hasCommits =
    (chartsState.commitsInfo?.length ?? 0) > 0;

  return (
    <div className="container">
      <h1 data-testid="repoNameTitle">
        Tarea: {page.repoName}
      </h1>

      {!page.isStudent && (
        <h1 data-testid="repoOwnerTitle">
          Autor: {page.ownerName}
        </h1>
      )}

      {/* Selector de ramas */}

      <div
        style={{
          maxWidth: 800,
          width: "100%",
          margin: "20px auto",
          padding: 16,
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          boxSizing: "border-box",
        }}
      >
        <h2>
          Análisis por ramas de Git
        </h2>

        <BranchSelector
          branches={page.availableBranches}
          selectedBranch={
            page.selectedBranch
          }
          onBranchChange={
            page.handleBranchChange
          }
          loading={
            page.loadingBranches
          }
          disabled={
            page.loadingBranches
          }
        />

        {page.branchError && (
          <p
            role="alert"
            style={{
              color: "#b91c1c",
            }}
          >
            {page.branchError}
          </p>
        )}

        <p>
          Rama:{" "}
          <strong>
            {page.selectedBranch === "all"
              ? "Todas las ramas"
              : page.selectedBranch ||
                "Predeterminada del repositorio"}
          </strong>
        </p>
      </div>

      {/* Carga */}

      {page.loading && (
        <div className="mainInfoContainer">
          <PropagateLoader
            color="#36d7b7"
          />
        </div>
      )}

      {/* Error de consulta */}

      {!page.loading &&
        page.visualizationError && (
          <div
            className="error-message"
            role="alert"
            data-testid="errorMessage"
          >
            {page.visualizationError}
          </div>
        )}

      {/* Contenido */}

      {!page.loading &&
        !page.visualizationError && (
          <>
            {!hasCommits && (
              <div
                className="error-message"
                role="status"
              >
                No se encontraron commits en
                la consulta seleccionada.
                Puedes utilizar la opción
                Topología Git para consultar
                el grafo completo del repositorio.
              </div>
            )}

            {!page.isStudent && (
              <div className="navigation-buttons">
                <button
                  type="button"
                  className="nav-button"
                  onClick={
                    page.goToPreviousStudent
                  }
                  disabled={
                    page.currentIndex <= 0
                  }
                >
                  Anterior
                </button>

                <button
                  type="button"
                  className="nav-button"
                  onClick={
                    page.goToNextStudent
                  }
                  disabled={
                    page.currentIndex >=
                    page.fetchedSubmissions.length - 1
                  }
                >
                  Siguiente
                </button>
              </div>
            )}

            <div className="mainInfoContainer">
              <TDDCharts
                key={
                  `${page.repoName}-` +
                  page.selectedBranch
                }
                commits={
                  chartsState.commitsInfo ?? []
                }
                tddLogs={
                  chartsState.tddLogsInfo
                }
                commitsTddCycles={
                  chartsState.commitsTddCycles
                }
                port={props.port}
                role={props.role}
                metric={
                  chartsState.metric
                }
                setMetric={
                  chartsState.setMetric
                }
                typegraphs={
                  props.graphs
                }
                selectedBranch={
                  page.selectedBranch
                }
              />
            </div>
          </>
        )}

      {/* Retroalimentación docente */}

      {props.role !== "student" && (
        <div className="feedback-container">
          <h2 className="comments-title">
            Escribe un comentario:
          </h2>

          <textarea
            id="feedback"
            value={page.feedback}
            onChange={(event) =>
              page.setFeedback(
                event.target.value
              )
            }
            placeholder="Ingrese su retroalimentación aquí"
          />

          <button
            type="button"
            onClick={
              page.handleSubmitFeedback
            }
            disabled={
              page.isSubmitting
            }
          >
            {page.isSubmitting
              ? "Enviando..."
              : "Enviar"}
          </button>
        </div>
      )}

      {!page.loading &&
        page.comments &&
        page.comments.length > 0 && (
          <div className="comments-section">
            <h2 className="comments-title">
              Comentarios
            </h2>

            <div className="comments-list">
              {page.comments.map(
                (comment) => (
                  <div
                    key={
                      `${comment.teacher_id}-` +
                      comment.created_at
                    }
                    className="comment-card"
                  >
                    <div className="comment-header">
                      <strong className="comment-author">
                        {page.emails[
                          comment.teacher_id
                        ] ||
                          "Correo no disponible"}
                      </strong>

                      <span className="comment-date">
                        {new Date(
                          comment.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="comment-body">
                      <p>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default TDDChartPage;
