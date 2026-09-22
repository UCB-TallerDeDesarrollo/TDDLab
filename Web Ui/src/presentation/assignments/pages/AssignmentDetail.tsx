import { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import StatefulButton from "../../../shared/components/StatefulButton";
import StartFinishActionButton from "../../../shared/components/StartFinishActionButton";
import ContentState from "../../../shared/components/ContentState";
import DetailPageShell from "../../../shared/components/DetailPageShell";
import StudentDetailCard from "../../../shared/components/StudentDetailCard";
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

type AssignmentDetailData = ReturnType<typeof useAssignmentDetailData>;

function PageStateContent({
  isLoading,
}: Readonly<{ isLoading: boolean }>) {
  return (
    <div className="detail-center-state" data-testid="loading-indicator">
      {isLoading ? (
        <ContentState variant="loading" title="Cargando..." />
      ) : (
        <Typography color="error">
          No se pudo cargar el detalle de la tarea. Intenta nuevamente.
        </Typography>
      )}
    </div>
  );
}

function GuardedActionButton({
  enabled,
  onClick,
  children,
}: Readonly<{
  enabled: boolean;
  onClick: () => void;
  children: ReactNode;
}>) {
  return (
    <StatefulButton
      variantStyle={enabled ? "primary" : "secondary"}
      onClick={() => {
        if (enabled) onClick();
      }}
    >
      {children}
    </StatefulButton>
  );
}

function StudentAssignmentSection({
  detailData,
  hasStudentRepository,
  isActionLoading,
}: Readonly<{
  detailData: AssignmentDetailData;
  hasStudentRepository: boolean;
  isActionLoading: boolean;
}>) {
  const {
    studentStatusLabel,
    studentSubmission,
    showIAButton,
    openLinkDialog,
    openCommentDialog,
    redirectStudentToGraph,
    redirectStudentToAssistant,
    studentRepositoryLink,
  } = detailData;
  const canUseAssistant = Boolean(studentSubmission?.repository_link);
  const getStatusClassName = () => {
    if (studentSubmission?.status === "in progress") return "assignment-status--progress";
    if (studentSubmission?.status === "pending") return "assignment-status--pending";
    if (studentSubmission?.status === "delivered") return "assignment-status--sent";
    return undefined;
  };

  return (
    <StudentDetailCard
      title="Mi entrega"
      titleClassName="assignment-section-title"
      sectionClassName="assignment-student-card"
      contentClassName="assignment-student-content"
      detailsClassName="assignment-student-details"
      actionsClassName="assignment-student-actions"
      details={
        <StudentSubmissionSummary
          status={studentStatusLabel}
          repositoryLink={studentRepositoryLink}
          comment={studentSubmission?.comment || undefined}
          statusClassName={getStatusClassName()}
        />
      }
      actions={
        <>
          <StartFinishActionButton
            status={studentSubmission?.status}
            startLabel="Iniciar tarea"
            finishLabel="Finalizar tarea"
            onStart={openLinkDialog}
            onFinish={openCommentDialog}
            loading={isActionLoading}
          />

          <GuardedActionButton
            enabled={hasStudentRepository}
            onClick={redirectStudentToGraph}
          >
            Ver gráfica
          </GuardedActionButton>

          {showIAButton && (
            <GuardedActionButton
              enabled={canUseAssistant}
              onClick={redirectStudentToAssistant}
            >
              Asistente IA
            </GuardedActionButton>
          )}
        </>
      }
    />
  );
}

function DeliveriesStateContent({ state }: Readonly<{ state: AssignmentDetailData["deliveriesState"] }>) {
  if (state === "loading") {
    return <ContentState variant="loading" title="Cargando..." />;
  }

  if (state === "error") {
    return <ContentState variant="error" title="Error al cargar..." />;
  }

  return <ContentState variant="empty" title="Sin entregas" />;
}

function TeacherAssignmentSection({
  detailData,
}: Readonly<{ detailData: AssignmentDetailData }>) {
  const {
    deliveriesState,
    deliveriesRows,
    disableAdditionalGraphs,
    openTeacherGraph,
    openTeacherAssistant,
    openTeacherAdditionalGraphs,
  } = detailData;
  const shouldShowTable = deliveriesState !== "loading" &&
    deliveriesState !== "error" &&
    deliveriesState !== "empty";

  return (
    <>
      <h2 className="assignment-section-title">Lista de entregas</h2>
      {shouldShowTable ? (
        <section className="assignment-deliveries-card">
          <DeliveriesTable
            state={deliveriesState}
            rows={deliveriesRows}
            showAdditionalGraphs={disableAdditionalGraphs === false}
            onOpenGraph={openTeacherGraph}
            onOpenAssistant={openTeacherAssistant}
            onOpenAdditionalGraphs={openTeacherAdditionalGraphs}
          />
        </section>
      ) : (
        <div className="assignment-deliveries-state">
          <DeliveriesStateContent state={deliveriesState} />
        </div>
      )}
    </>
  );
}

function LoadedAssignmentContent({
  detailData,
}: Readonly<{ detailData: AssignmentDetailData }>) {
  const {
    assignment,
    groupDetails,
    studentSubmission,
    isStudent,
  } = detailData;

  if (assignment === null || assignment === undefined) {
    return null;
  }

  const hasStudentRepository = Boolean(studentSubmission?.repository_link);

  return (
    <>
      <TaskOverviewCard
        title={assignment.title}
        groupName={groupDetails?.groupName || "Cargando grupo..."}
        startDate={toDisplayDate(assignment.start_date)}
        endDate={toDisplayDate(assignment.end_date)}
      />

      {isStudent ? (
        <StudentAssignmentSection
          detailData={detailData}
          hasStudentRepository={hasStudentRepository}
          isActionLoading={detailData.isActionLoading}
        />
      ) : (
        <TeacherAssignmentSection detailData={detailData} />
      )}
    </>
  );
}

function AssignmentDetail({ role, userid }: Readonly<AssignmentDetailProps>) {
  const navigate = useNavigate();
  const { id } = useParams();
  const assignmentid = Number(id);
  const detailData = useAssignmentDetailData({ role, userid, assignmentid, navigate });
  const isLoading = detailData.assignmentState === "loading";
  const hasError = detailData.assignmentState === "error" || !detailData.assignment;

  return (
    <>
      <DetailPageShell>
        {isLoading || hasError ? (
          <PageStateContent isLoading={isLoading} />
        ) : (
          <LoadedAssignmentContent detailData={detailData} />
        )}
      </DetailPageShell>

      <GitLinkDialog
        open={detailData.linkDialogOpen}
        onClose={detailData.closeLinkDialog}
        onSend={detailData.sendGithubLink}
      />

      <CommentDialog
        open={detailData.isCommentDialogOpen}
        link={detailData.submissionRepositoryLink}
        onSend={detailData.sendComment}
        onClose={detailData.closeCommentDialog}
      />

      <FeedbackSnackbar
        open={Boolean(detailData.uiMessage)}
        message={detailData.uiMessage ?? ""}
        onClose={detailData.closeUiMessage}
        severity="warning"
      />
    </>
  );
}

export default AssignmentDetail;
