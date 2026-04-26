import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import StatefulButton from "../../../shared/components/StatefulButton";
import { CommentDialog } from "../../../shared/components/CommentDialog";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import { GitLinkDialog } from "../../../shared/components/GitHubLinkDialog";
import { formatDate } from "../../../utils/dateUtils";
import { DeliveriesTable } from "../components/detail/DeliveriesTable";
import { StudentSubmissionSummary } from "../components/detail/StudentSubmissionSummary";
import { TaskOverviewCard } from "../components/detail/TaskOverviewCard";
import { useAssignmentDetailData } from "../hooks/useAssignmentDetailData";
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
              <StatefulButton
                variantStyle={!Boolean(studentSubmission) ? 'primary' : 'secondary'}
                onClick={() => {
                  if (!Boolean(studentSubmission)) openLinkDialog();
                }}
              >
                Iniciar tarea
              </StatefulButton>

              <StatefulButton
                variantStyle={studentSubmission?.repository_link ? 'primary' : 'secondary'}
                onClick={() => {
                  if (studentSubmission?.repository_link) redirectStudentToGraph();
                }}
              >
                Ver gráfica
              </StatefulButton>

              <StatefulButton
                variantStyle={!isTaskInProgress ? 'primary' : 'secondary'}
                onClick={() => {
                  if (!isTaskInProgress) openCommentDialog();
                }}
              >
                Finalizar tarea
              </StatefulButton>

              {showIAButton && (
                <StatefulButton
                  variantStyle={studentSubmission?.repository_link ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (studentSubmission?.repository_link) redirectStudentToAssistant();
                  }}
                >
                  Asistente IA
                </StatefulButton>
              )}
            </div>
          </section>
        ) : (
          <>
            <h2 className="assignment-section-title">Lista de Estudiantes</h2>

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

      <FeedbackSnackbar
        open={Boolean(uiMessage)}
        message={uiMessage ?? ""}
        onClose={closeUiMessage}
        severity="warning"
      />
    </div>
  );
};

export default AssignmentDetail;
