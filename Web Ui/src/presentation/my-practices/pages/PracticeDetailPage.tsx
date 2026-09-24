import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GitLinkDialog } from "../../../shared/components/GitHubLinkDialog";
import { CommentDialog } from "../../../shared/components/CommentDialog";
import ContentState from "../../../shared/components/ContentState";
import DetailPageShell from "../../../shared/components/DetailPageShell";
import StudentDetailCard from "../../../shared/components/StudentDetailCard";
import StatefulButton from "../../../shared/components/StatefulButton";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import { PracticeOverviewCard } from "../components/PracticeOverviewCard";
import { usePracticeDetail } from "../hooks/usePracticeDetail";
import "./PracticeDetailPage.css";

interface PracticeDetailPageProps {
  userid: number;
}

function getStatusClass(status: string | undefined): string {
  if (status === "delivered") return "is-finished";
  if (status === "in progress") return "is-progress";
  return "is-pending";
}

const PracticeDetailPage: React.FC<PracticeDetailPageProps> = ({ userid }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const practiceid = Number(id);

  const {
    practiceState,
    practice,
    submission,
    createdAt,
    statusLabel,
    canStartPractice,
    canFinishPractice,
    isSavingSubmission,
    linkDialogOpen,
    isCommentDialogOpen,
    openLinkDialog,
    closeLinkDialog,
    sendGithubLink,
    openCommentDialog,
    closeCommentDialog,
    sendComment,
    redirectToGraph,
    uiMessage,
    closeUiMessage,
  } = usePracticeDetail({ userid, practiceid, navigate });

  const canView = Boolean(submission?.repository_link);
  const showLifecycleAction = canStartPractice || canFinishPractice;

  return (
      <>
        <DetailPageShell>
          {practiceState === "loading" && (
              <div className="detail-center-state">
                <ContentState variant="loading" title="Cargando..." />
              </div>
          )}
          {practiceState === "error" && (
              <div className="detail-center-state">
                <ContentState
                    variant="error"
                    title="Error al cargar..."
                    description="No se pudo cargar el detalle de la practica. Intenta nuevamente."
                />
              </div>
          )}
          {practiceState === "empty" && (
              <div className="detail-center-state">
                <ContentState
                    variant="empty"
                    title="Sin resultados"
                    description="No se encontro la practica solicitada."
                />
              </div>
          )}
          {practice && (
              <>
                <PracticeOverviewCard title={practice.title} createdAt={createdAt} />
                <StudentDetailCard
                    title="Mi practica"
                    titleClassName="practice-section-title"
                    sectionClassName="practice-student-card"
                    contentClassName="practice-student-content"
                    detailsClassName="practice-student-details"
                    actionsClassName="practice-student-actions"
                    details={
                      <>
                        <div className="practice-student-row practice-enlace-row">
                          <strong>Enlace:</strong>{" "}
                          {submission?.repository_link ? (
                              <a
                                  href={submission.repository_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="practice-link-anchor"
                              >
                                {submission.repository_link}
                              </a>
                          ) : (
                              <span style={{ marginLeft: "8px" }}>No se inicio la practica</span>
                          )}
                        </div>
                        <div className="practice-student-row practice-estado-row">
                          <strong>Estado:</strong>{" "}
                          <span
                              role="status"
                              aria-label="Estado de la práctica"
                              className={`practice-student-status ${getStatusClass(submission?.status)}`}
                          >
                      {statusLabel || "Sin estado"}
                    </span>
                        </div>
                      </>
                    }
                    actions={
                      <>
                        {showLifecycleAction && (
                            <StatefulButton
                                className="practice-lifecycle-action"
                                variantStyle="primary"
                                disabled={isSavingSubmission}
                                onClick={canStartPractice ? openLinkDialog : openCommentDialog}
                            >
                              {canStartPractice ? "Iniciar práctica" : "Finalizar práctica"}
                            </StatefulButton>
                        )}
                        <StatefulButton
                            variantStyle={canView ? "primary" : "secondary"}
                            disabled={!canView}
                            onClick={() => canView && redirectToGraph()}
                        >
                          Ver gráfica
                        </StatefulButton>
                      </>
                    }
                />
              </>
          )}
        </DetailPageShell>
        <GitLinkDialog
            open={linkDialogOpen}
            onClose={closeLinkDialog}
            onSend={sendGithubLink}
        />
        <CommentDialog
            open={isCommentDialogOpen}
            link={submission?.repository_link}
            onSend={(comment) => sendComment(comment)}
            onClose={closeCommentDialog}
        />
        <FeedbackSnackbar
            open={Boolean(uiMessage)}
            message={uiMessage ?? ""}
            severity="warning"
            onClose={closeUiMessage}
        />
      </>
  );
};

export default PracticeDetailPage;
