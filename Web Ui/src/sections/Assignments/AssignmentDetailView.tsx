import { Card, CardContent, Divider, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { formatDate } from "../../utils/dateUtils";
import { getSubmissionStatusLabel } from "../../utils/submissionStatus";
import { ActionButton } from "../Shared/Components/ActionButton";
import { InfoRow } from "../Shared/Components/InfoRow";
import { SubmissionTable } from "./components/SubmissionTable";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
import {
  assignmentDetailStyles,
  assignmentDetailSx,
} from "./AssignmentDetail.styles";
import type { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import type { SubmissionDataObject } from "../../modules/Submissions/Domain/submissionInterfaces";

interface AssignmentDetailViewProps {
  role: string;
  assignment: AssignmentDataObject | null;
  groupName?: string;
  studentSubmission?: SubmissionDataObject;
  submissionRepositoryLink?: string;
  linkDialogOpen: boolean;
  isCommentDialogOpen: boolean;
  showIAButton: boolean;
  isTaskInProgress: boolean;
  loadingSubmissions: boolean;
  submissions: SubmissionDataObject[];
  studentEmails: Record<number, string>;
  disableAdditionalGraphs: boolean;
  onOpenLinkDialog: () => void;
  onCloseLinkDialog: () => void;
  onSendGithubLink: (link: string) => Promise<void>;
  onOpenCommentDialog: () => void;
  onCloseCommentDialog: () => void;
  onSendComment: (comment: string) => Promise<void>;
  onViewStudentGraph: () => void;
  onOpenStudentAssistant: () => void;
  onViewGraph: (submission: SubmissionDataObject) => void;
  onOpenAssistant: (submission: SubmissionDataObject) => void;
  onViewAdditionalGraph: (submission: SubmissionDataObject) => void;
}

const isStudent = (role: string) => role === "student";

export const AssignmentDetailView = ({
  role,
  assignment,
  groupName,
  studentSubmission,
  submissionRepositoryLink,
  linkDialogOpen,
  isCommentDialogOpen,
  showIAButton,
  isTaskInProgress,
  loadingSubmissions,
  submissions,
  studentEmails,
  disableAdditionalGraphs,
  onOpenLinkDialog,
  onCloseLinkDialog,
  onSendGithubLink,
  onOpenCommentDialog,
  onCloseCommentDialog,
  onSendComment,
  onViewStudentGraph,
  onOpenStudentAssistant,
  onViewGraph,
  onOpenAssistant,
  onViewAdditionalGraph,
}: AssignmentDetailViewProps) => (
  <div style={assignmentDetailStyles.pageContainer}>
    {assignment ? (
      <Card variant="elevation" elevation={0} style={assignmentDetailStyles.card}>
        <CardContent style={assignmentDetailStyles.cardContent}>
          <div style={assignmentDetailStyles.detailsSection}>
            <Typography
              variant="h5"
              component="div"
              align="center"
              style={assignmentDetailStyles.assignmentTitle}
            >
              {assignment.title}
            </Typography>
            <InfoRow
              icon={<GroupsIcon sx={assignmentDetailSx.metaIcon} />}
              label="Grupo"
              value={groupName}
              textSx={assignmentDetailSx.metaText}
            />
            {isStudent(role) && (
              <InfoRow
                icon={<NotesOutlinedIcon sx={assignmentDetailSx.metaIcon} />}
                label="Instrucciones"
                value={assignment.description}
                textSx={assignmentDetailSx.metaText}
              />
            )}
            <InfoRow
              icon={<CalendarMonthIcon sx={assignmentDetailSx.metaIcon} />}
              label="Inicio"
              value={formatDate(assignment.start_date.toString())}
              textSx={assignmentDetailSx.metaText}
            />
            <InfoRow
              icon={<CalendarMonthIcon sx={assignmentDetailSx.metaIcon} />}
              label="Finalización"
              value={formatDate(assignment.end_date.toString())}
              textSx={assignmentDetailSx.metaText}
            />
            {isStudent(role) && (
              <InfoRow
                icon={<AccessTimeIcon sx={assignmentDetailSx.secondaryIcon} />}
                label="Estado"
                value={getSubmissionStatusLabel(studentSubmission?.status)}
                containerSx={assignmentDetailSx.compactRow}
                textSx={assignmentDetailSx.secondaryText}
              />
            )}

            {isStudent(role) && (
              <InfoRow
                icon={<LinkIcon sx={assignmentDetailSx.secondaryIcon} />}
                label="Enlace"
                value={
                  <a
                    href={studentSubmission?.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {studentSubmission?.repository_link}
                  </a>
                }
                containerSx={assignmentDetailSx.compactRow}
                textSx={assignmentDetailSx.secondaryText}
              />
            )}

            {isStudent(role) &&
              (assignment.comment ? (
                <InfoRow
                  icon={<CommentIcon sx={assignmentDetailSx.secondaryIcon} />}
                  label="Comentario"
                  value={
                    studentSubmission?.repository_link === "" ||
                    studentSubmission == null
                  }
                  containerSx={assignmentDetailSx.compactRow}
                  textSx={assignmentDetailSx.secondaryText}
                />
              ) : null)}
          </div>
          {isStudent(role) && (
            <ActionButton
              variant="contained"
              disabled={!!studentSubmission}
              onClick={onOpenLinkDialog}
            >
              Iniciar tarea
            </ActionButton>
          )}

          {isStudent(role) && (
            <ActionButton
              variant="contained"
              disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
              onClick={onViewStudentGraph}
              color="primary"
            >
              Ver gráfica
            </ActionButton>
          )}
          <GitLinkDialog
            open={linkDialogOpen}
            onClose={onCloseLinkDialog}
            onSend={onSendGithubLink}
          />

          {isStudent(role) && (
            <ActionButton
              variant="contained"
              disabled={isTaskInProgress}
              onClick={onOpenCommentDialog}
            >
              Finalizar tarea
            </ActionButton>
          )}
          {isStudent(role) && showIAButton && (
            <ActionButton
              variant="contained"
              disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
              onClick={onOpenStudentAssistant}
              color="primary"
            >
              Asistente IA
            </ActionButton>
          )}
          <CommentDialog
            open={isCommentDialogOpen}
            link={submissionRepositoryLink}
            onSend={onSendComment}
            onClose={onCloseCommentDialog}
          />
        </CardContent>
      </Card>
    ) : (
      <div style={assignmentDetailStyles.loadingContainer}>
        <CircularProgress size={60} thickness={5} data-testid="loading-indicator" />
      </div>
    )}
    {!isStudent(role) && (
      <div style={assignmentDetailStyles.adminContainer}>
        <Typography variant="h6" component="div" style={assignmentDetailStyles.adminTitle}>
          Lista de entregas
        </Typography>
        <Divider sx={{ borderBottomWidth: 3, borderColor: "#7F7F7F", mb: 3 }} />
        {loadingSubmissions ? (
          <div style={assignmentDetailStyles.tableLoadingContainer}>
            <CircularProgress size={40} thickness={4} />
          </div>
        ) : (
          <SubmissionTable
            submissions={submissions}
            studentEmails={studentEmails}
            disableAdditionalGraphs={disableAdditionalGraphs}
            showAdditionalGraphs={!isStudent(role)}
            onViewGraph={onViewGraph}
            onOpenAssistant={onOpenAssistant}
            onViewAdditionalGraph={onViewAdditionalGraph}
          />
        )}
      </div>
    )}
  </div>
);
