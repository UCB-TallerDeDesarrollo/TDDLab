import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Link as LinkIcon } from "@mui/icons-material";
import { CommentDialog } from "../../../shared/components/CommentDialog";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import { GitLinkDialog } from "../../../shared/components/GitHubLinkDialog";
import { PracticeOverviewCard } from "../components/detail/PracticeOverviewCard";
import { usePracticeDetailData } from "../hooks/usePracticeDetailData";
import "./PracticeDetail.css";

interface PracticeDetailProps {
  title: string;
  userid: number;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({ userid }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const practiceid = Number(id);

  const {
    practiceState,
    submissionState,
    practice,
    submission,
    createdAt,
    statusLabel,
    isTaskInProgress,
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
  } = usePracticeDetailData({ userid, practiceid, navigate });

  if (practiceState === "loading") {
    return (
      <div className="practice-detail-page practice-center-state">
        <CircularProgress
          size={60}
          thickness={5}
          data-testid="loading-indicator"
        />
      </div>
    );
  }

  if (practiceState === "error" || practiceState === "empty" || !practice) {
    return (
      <div className="practice-detail-page practice-center-state">
        <Typography color="error">
          No se pudo cargar el detalle de la practica. Intenta nuevamente.
        </Typography>
      </div>
    );
  }

  return (
    <div className="practice-detail-page">
      <div className="practice-content-shell">
        <PracticeOverviewCard title={practice.title} createdAt={createdAt} />

        <section className="practice-student-card">
          <Typography component="h2" className="practice-section-title">
            Mi practica
          </Typography>

          <p className="practice-student-row">
            <strong>Estado:</strong> {statusLabel}
          </p>

          <p className="practice-student-row">
            <strong>Enlace:</strong>{" "}
            {submissionState === "loading" ? (
              "Cargando enlace..."
            ) : submission?.repository_link ? (
              <a
                href={submission.repository_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="practice-link-cell">
                  <LinkIcon fontSize="small" />
                  {submission.repository_link}
                </span>
              </a>
            ) : submissionState === "error" ? (
              "No disponible por error de carga"
            ) : (
              "No se inicio la practica"
            )}
          </p>

          <div className="practice-student-actions">
            <Button
              variant="contained"
              className="practice-action-btn"
              disabled={Boolean(submission)}
              onClick={openLinkDialog}
            >
              Iniciar practica
            </Button>

            <Button
              variant="contained"
              className="practice-action-btn"
              disabled={!submission?.repository_link}
              onClick={redirectToGraph}
            >
              Ver gráfica
            </Button>

            <Button
              variant="contained"
              className="practice-action-btn"
              disabled={isTaskInProgress}
              onClick={openCommentDialog}
            >
              Finalizar practica
            </Button>
          </div>
        </section>
      </div>

      <GitLinkDialog
        open={linkDialogOpen}
        onClose={closeLinkDialog}
        onSend={sendGithubLink}
      />

      <CommentDialog
        open={isCommentDialogOpen}
        link={submission?.repository_link}
        onSend={sendComment}
        onClose={closeCommentDialog}
      />

      <FeedbackSnackbar
        open={Boolean(uiMessage)}
        message={uiMessage ?? ""}
        onClose={closeUiMessage}
        severity="warning"
      />
    </div>
  );
};

export default PracticeDetail;
