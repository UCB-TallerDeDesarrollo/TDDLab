import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Snackbar, Typography } from "@mui/material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
import { TaskOverviewCard } from "./components/detail/TaskOverviewCard";
import { StudentSubmissionSummary } from "./components/detail/StudentSubmissionSummary";
import { DeliveriesTable } from "./components/detail/DeliveriesTable";
import { useAssignmentDetailData } from "./hooks/useAssignmentDetailData";
import { formatDate } from "../../utils/dateUtils";
import "./AssignmentDetail.css";

function toDisplayDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const normalized = value instanceof Date ? value.toISOString() : value.toString();
  return formatDate(normalized);
}

interface AssignmentDetailProps {
  role: string;
  userid: number;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ role, userid }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const assignmentid = Number(id);

  const {
    assignment,
    groupDetails,
    assignmentState,
    deliveriesState,
    deliveriesRows,
    studentSubmission,
    studentStatusLabel,
    isTaskInProgress,
    linkDialogOpen,
    isCommentDialogOpen,
    showIAButton,
    disableAdditionalGraphs,
    isStudent,
    openLinkDialog,
    closeLinkDialog,
    sendGithubLink,
    openCommentDialog,
    closeCommentDialog,
    sendComment,
    redirectStudentToGraph,
    redirectStudentToAssistant,
    openTeacherGraph,
    openTeacherAssistant,
    openTeacherAdditionalGraphs,
    studentRepositoryLink,
    submissionRepositoryLink,
    uiMessage,
    closeUiMessage,
  } = useAssignmentDetailData({ role, userid, assignmentid, navigate });

  if (assignmentState === "loading") {
    return (
      <div className="assignment-detail-page assignment-center-state">
        <CircularProgress size={60} thickness={5} data-testid="loading-indicator" />
      </div>
    );
  }

  if (assignmentState === "error" || !assignment) {
    return (
      <div className="assignment-detail-page assignment-center-state">
        <Typography color="error">
          No se pudo cargar el detalle de la tarea. Intenta nuevamente.
        </Typography>
      </div>
    );
  }

  return (
    <div className="assignment-detail-page">
      <div className="assignment-content-shell">
        <TaskOverviewCard
          title={assignment.title}
          groupName={groupDetails?.groupName || "Cargando grupo..."}
          startDate={toDisplayDate(assignment.start_date)}
          endDate={toDisplayDate(assignment.end_date)}
        />

        {isStudent ? (
          <section className="assignment-student-card">
            <StudentSubmissionSummary
              status={studentStatusLabel}
              repositoryLink={studentRepositoryLink}
              comment={studentSubmission?.comment || undefined}
            />

            <div className="assignment-student-actions">
              <Button
                variant="contained"
                className="assignment-action-btn"
                disabled={Boolean(studentSubmission)}
                onClick={openLinkDialog}
              >
                Iniciar tarea
              </Button>

              <Button
                variant="contained"
                className="assignment-action-btn"
                disabled={!studentSubmission?.repository_link}
                onClick={redirectStudentToGraph}
              >
                Ver gráfica
              </Button>

              <Button
                variant="contained"
                className="assignment-action-btn"
                disabled={isTaskInProgress}
                onClick={openCommentDialog}
              >
                Finalizar tarea
              </Button>

              {showIAButton && (
                <Button
                  variant="contained"
                  className="assignment-action-btn"
                  disabled={!studentSubmission?.repository_link}
                  onClick={redirectStudentToAssistant}
                >
                  Asistente IA
                </Button>
              )}
            </div>
          </section>
        ) : (
          <>
            <h2 className="assignment-section-title">Lista de entregas</h2>

            <section className="assignment-deliveries-card">
              <DeliveriesTable
                state={deliveriesState}
                rows={deliveriesRows}
                showAdditionalGraphs={!disableAdditionalGraphs}
                onOpenGraph={openTeacherGraph}
                onOpenAssistant={openTeacherAssistant}
                onOpenAdditionalGraphs={openTeacherAdditionalGraphs}
              />
            </section>
          </>
        )}
      </div>

      <GitLinkDialog
        open={linkDialogOpen}
        onClose={closeLinkDialog}
        onSend={sendGithubLink}
      />

      <CommentDialog
        open={isCommentDialogOpen}
        link={submissionRepositoryLink}
        onSend={sendComment}
        onClose={closeCommentDialog}
      />

      <Snackbar
        open={Boolean(uiMessage)}
        autoHideDuration={4000}
        onClose={closeUiMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeUiMessage} severity="warning" variant="filled">
          {uiMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AssignmentDetail;
