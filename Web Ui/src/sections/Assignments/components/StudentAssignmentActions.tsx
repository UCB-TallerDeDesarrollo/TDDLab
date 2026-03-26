import { CSSProperties } from "react";
import { Button } from "@mui/material";
import { GitLinkDialog } from "./GitHubLinkDialog";
import { CommentDialog } from "./CommentDialog";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { isStudent } from "../utils/assignmentDetailHelpers";

interface StudentAssignmentActionsProps {
  role: string;
  studentSubmission?: SubmissionDataObject;
  submissionLink?: string;
  showIAButton: boolean;
  isTaskInProgress: boolean;
  actionButtonStyle: CSSProperties;
  linkDialogOpen: boolean;
  isCommentDialogOpen: boolean;
  onOpenLinkDialog: () => void;
  onStudentGraph: () => void;
  onOpenCommentDialog: () => void;
  onOpenAssistant: () => void;
  onCloseLinkDialog: () => void;
  onSendGithubLink: (repositoryLink: string) => Promise<void>;
  onCloseCommentDialog: () => void;
  onSendComment: (comment: string) => Promise<void>;
}

export function StudentAssignmentActions({
  role,
  studentSubmission,
  submissionLink,
  showIAButton,
  isTaskInProgress,
  actionButtonStyle,
  linkDialogOpen,
  isCommentDialogOpen,
  onOpenLinkDialog,
  onStudentGraph,
  onOpenCommentDialog,
  onOpenAssistant,
  onCloseLinkDialog,
  onSendGithubLink,
  onCloseCommentDialog,
  onSendComment,
}: Readonly<StudentAssignmentActionsProps>) {
  if (!isStudent(role)) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        disabled={!!studentSubmission}
        onClick={onOpenLinkDialog}
        style={actionButtonStyle}
      >
        Iniciar tarea
      </Button>

      <Button
        variant="contained"
        disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
        onClick={onStudentGraph}
        color="primary"
        style={actionButtonStyle}
      >
        Ver gráfica
      </Button>

      <GitLinkDialog
        open={linkDialogOpen}
        onClose={onCloseLinkDialog}
        onSend={onSendGithubLink}
      />

      <Button
        variant="contained"
        disabled={isTaskInProgress}
        onClick={onOpenCommentDialog}
        style={actionButtonStyle}
      >
        Finalizar tarea
      </Button>

      {showIAButton && (
        <Button
          variant="contained"
          disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
          onClick={onOpenAssistant}
          color="primary"
          style={actionButtonStyle}
        >
          Asistente IA
        </Button>
      )}

      <CommentDialog
        open={isCommentDialogOpen}
        link={submissionLink}
        onSend={onSendComment}
        onClose={onCloseCommentDialog}
      />
    </>
  );
}
