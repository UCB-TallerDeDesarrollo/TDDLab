import React, { useState } from "react";
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
import { updatePracticeRepositoryLink } from "../services/practiceSubmissionsService";
import "./PracticeDetailPage.css";

interface PracticeDetailPageProps {
  userid: number;
}

function getStatusClass(status: string | undefined): string {
  if (status === "delivered") return "is-finished";
  if (status === "in progress") return "is-progress";
  return "is-pending";
}

const PencilIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const PracticeDetailPage: React.FC<PracticeDetailPageProps> = ({ userid }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const practiceid = Number(id);

  const {
    practiceState,
    practice,
    submission,
    setSubmission,
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

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editedLink, setEditedLink] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const canView = Boolean(submission?.repository_link);
  const showLifecycleAction = canStartPractice || canFinishPractice;

  const handleStartEdit = () => {
    if (submission?.repository_link) {
      setEditedLink(submission.repository_link);
      setIsEditingLink(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingLink(false);
    setEditedLink("");
  };

  const handleSaveLinkInline = async () => {
    if (!submission?.id || !editedLink.trim()) return;

    try {
      setIsSavingLink(true);
      await updatePracticeRepositoryLink(submission.id, editedLink.trim());
      setSubmission((prev) =>
        prev ? { ...prev, repository_link: editedLink.trim() } : null
      );
      setIsEditingLink(false);
      setLocalFeedback("URL de GitHub actualizada correctamente.");
    } catch (error) {
      setLocalFeedback("Error al actualizar la URL. Intenta nuevamente.");
    } finally {
      setIsSavingLink(false);
    }
  };

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
                      isEditingLink ? (
                        <div className="practice-edit-container">
                          <input
                            type="url"
                            className="practice-edit-input"
                            value={editedLink}
                            onChange={(e) => setEditedLink(e.target.value)}
                            placeholder="https://github.com/usuario/repositorio"
                            disabled={isSavingLink}
                          />
                          <button
                            type="button"
                            className="practice-save-btn"
                            onClick={handleSaveLinkInline}
                            disabled={isSavingLink || !editedLink.trim()}
                          >
                            {isSavingLink ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            className="practice-cancel-btn"
                            onClick={handleCancelEdit}
                            disabled={isSavingLink}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="practice-link-cell">
                          <a
                            href={submission.repository_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="practice-link-anchor"
                          >
                            {submission.repository_link}
                          </a>
                          <button
                            type="button"
                            className="practice-edit-btn"
                            onClick={handleStartEdit}
                            title="Editar URL de GitHub"
                          >
                            <PencilIcon />
                          </button>
                        </span>
                      )
                    ) : (
                      <span style={{ marginLeft: "8px" }}>No se inicio la practica</span>
                    )}
                  </div>
                  <div className="practice-student-row practice-estado-row">
                    <strong>Estado:</strong>{" "}
                    <output
                      aria-label="Estado de la práctica"
                      className={`practice-student-status ${getStatusClass(
                        submission?.status
                      )}`}
                    >
                      {statusLabel || "Sin estado"}
                    </output>
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
        link={submission?.repository_link ?? ""}
        onSend={(comment, updatedLink) => sendComment(comment, updatedLink ?? "")}
        onClose={closeCommentDialog}
        disabled={isSavingSubmission}
      />
      <FeedbackSnackbar
        open={Boolean(uiMessage || localFeedback)}
        message={uiMessage || localFeedback || ""}
        severity={
          (uiMessage || localFeedback)?.toLowerCase().includes("no se pudo") ||
          (uiMessage || localFeedback)?.toLowerCase().includes("error")
            ? "error"
            : "info"
        }
        onClose={() => {
          closeUiMessage();
          setLocalFeedback(null);
        }}
      />
    </>
  );
};

export default PracticeDetailPage;