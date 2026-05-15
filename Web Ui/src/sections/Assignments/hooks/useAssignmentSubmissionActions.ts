import { useCallback, useMemo, useState } from "react";
import {
  createAssignmentSubmission,
  finishAssignmentSubmission,
} from "../utils/submissionActions";

interface UseAssignmentSubmissionActionsParams {
  assignmentId: number;
  userId: number;
  submission?: { id: number; status?: string } | null;
  refreshAssignmentDetailData: () => Promise<void>;
}

export const useAssignmentSubmissionActions = (
  params: UseAssignmentSubmissionActionsParams
) => {
  const { assignmentId, userId, submission, refreshAssignmentDetailData } =
    params;
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const isTaskInProgress = useMemo(
    () => submission?.status !== "in progress",
    [submission?.status]
  );

  const handleOpenLinkDialog = useCallback(() => {
    setLinkDialogOpen(true);
  }, []);

  const handleCloseLinkDialog = useCallback(() => {
    setLinkDialogOpen(false);
  }, []);

  const handleOpenCommentDialog = useCallback(() => {
    setIsCommentDialogOpen(true);
  }, []);

  const handleCloseCommentDialog = useCallback(() => {
    setIsCommentDialogOpen(false);
  }, []);

  const handleSendGithubLink = useCallback(
    async (repositoryLink: string) => {
      if (!assignmentId) {
        return;
      }

      await createAssignmentSubmission({
        assignmentId: assignmentId,
        userId: userId,
        repositoryLink: repositoryLink,
      });
      handleCloseLinkDialog();
      await refreshAssignmentDetailData();
    },
    [
      assignmentId,
      userId,
      handleCloseLinkDialog,
      refreshAssignmentDetailData,
    ]
  );

  const handleSendComment = useCallback(
    async (comment: string) => {
      if (!submission) {
        return;
      }

      await finishAssignmentSubmission({
        submissionId: submission.id,
        comment,
      });
      await refreshAssignmentDetailData();
      handleCloseCommentDialog();
    },
    [submission, refreshAssignmentDetailData, handleCloseCommentDialog]
  );

  return {
    linkDialogOpen,
    isCommentDialogOpen,
    isTaskInProgress,
    handleOpenLinkDialog,
    handleCloseLinkDialog,
    handleOpenCommentDialog,
    handleCloseCommentDialog,
    handleSendGithubLink,
    handleSendComment,
  };
};
