import { useCallback, useMemo } from "react";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../../modules/Submissions/Aplication/createSubmission";
import { FinishSubmission } from "../../../modules/Submissions/Aplication/finishSubmission";
import type {
  SubmissionCreationObject,
  SubmissionDataObject,
  SubmissionUpdateObject,
} from "../../../modules/Submissions/Domain/submissionInterfaces";

interface UseAssignmentSubmissionActionsParams {
  assignmentId: number;
  userId: number;
  submission: SubmissionDataObject | null;
  onRefresh: () => Promise<void>;
  onCloseLinkDialog: () => void;
  onCloseCommentDialog: () => void;
}

export const useAssignmentSubmissionActions = ({
  assignmentId,
  userId,
  submission,
  onRefresh,
  onCloseLinkDialog,
  onCloseCommentDialog,
}: UseAssignmentSubmissionActionsParams) => {
  const submissionsRepository = useMemo(() => new SubmissionRepository(), []);
  const createSubmission = useMemo(
    () => new CreateSubmission(submissionsRepository),
    [submissionsRepository]
  );
  const finishSubmission = useMemo(
    () => new FinishSubmission(submissionsRepository),
    [submissionsRepository]
  );

  const sendGithubLink = useCallback(
    async (repositoryLink: string) => {
      if (!assignmentId) {
        return;
      }

      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const submissionData: SubmissionCreationObject = {
        assignmentid: assignmentId,
        userid: userId,
        status: "in progress",
        repository_link: repositoryLink,
        start_date: start_date,
      };

      await createSubmission.createSubmission(submissionData);
      await onRefresh();
      onCloseLinkDialog();
    },
    [assignmentId, createSubmission, onCloseLinkDialog, onRefresh, userId]
  );

  const sendComment = useCallback(
    async (comment: string) => {
      if (submission) {
        const endDate = new Date();
        const end_date = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );
        const submissionData: SubmissionUpdateObject = {
          id: submission.id,
          status: "delivered",
          end_date: end_date,
          comment: comment,
        };

        await finishSubmission.finishSubmission(submission.id, submissionData);
        await onRefresh();
        onCloseLinkDialog();
      }

      onCloseCommentDialog();
    },
    [finishSubmission, onCloseCommentDialog, onCloseLinkDialog, onRefresh, submission]
  );

  return {
    sendGithubLink,
    sendComment,
  };
};
