import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SubmissionDataObject,
} from "../../modules/Submissions/Domain/submissionInterfaces";
import { AssignmentDetailView } from "./AssignmentDetailView";
import {
  useAssignmentDetail,
  useAssignmentSubmissions,
  useFeatureFlagEnabled,
  useGroupDetail,
  useStudentSubmission,
  useSubmissionByUserAndAssignment,
} from "./hooks/useAssignmentDetailData";
import { useAssignmentSubmissionActions } from "./hooks/useAssignmentSubmissionActions";
import { useAssignmentEmails } from "./hooks/useAssignmentEmails";
import { useAssignmentDialogs } from "./hooks/useAssignmentDialogs";

import {
  handleRedirectAdmin,
  handleRedirectStudent,
} from "../Shared/handlers.ts";
import { isStudent } from "../../utils/roleGuards";

export interface AssignmentDetailProps {
  role: string;
  userid: number;
}

const AssignmentDetailContainer: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
}) => {
  const { id } = useParams();
  const assignmentid = Number(id);
  const navigate = useNavigate();
  const assignment = useAssignmentDetail(assignmentid);
  const groupDetails = useGroupDetail(assignment?.groupid);
  const {
    submissions,
    loading: loadingSubmissions,
    refresh: refreshSubmissions,
  } = useAssignmentSubmissions(assignmentid, !isStudent(role));
  const { studentSubmission, refresh: refreshStudentSubmission } =
    useStudentSubmission(assignmentid, userid, isStudent(role));
  const { submission, refresh: refreshSubmission } =
    useSubmissionByUserAndAssignment(assignmentid, userid);
  const additionalGraphsEnabled = useFeatureFlagEnabled(
    "Mostrar Graficas Adicionales",
    { enabled: !isStudent(role), defaultValue: false }
  );
  const showIAButton = useFeatureFlagEnabled("Boton Asistente IA", {
    enabled: isStudent(role),
    defaultValue: false,
    fallbackValue: true,
  });
  const disableAdditionalGraphs = !additionalGraphsEnabled;
  const isTaskInProgress = submission?.status !== "in progress";
  const { studentEmails } = useAssignmentEmails(submissions);
  const {
    linkDialogOpen,
    isCommentDialogOpen,
    handleOpenLinkDialog,
    handleCloseLinkDialog,
    handleOpenCommentDialog,
    handleCloseCommentDialog,
  } = useAssignmentDialogs();

  const refreshSubmissionData = useCallback(async () => {
    await Promise.all([
      refreshSubmissions(),
      refreshStudentSubmission(),
      refreshSubmission(),
    ]);
  }, [refreshSubmissions, refreshStudentSubmission, refreshSubmission]);

  const { sendGithubLink, sendComment } = useAssignmentSubmissionActions({
    assignmentId: assignmentid,
    userId: userid,
    submission,
    onRefresh: refreshSubmissionData,
    onCloseLinkDialog: handleCloseLinkDialog,
    onCloseCommentDialog: handleCloseCommentDialog,
  });

  const handleViewGraph = useCallback(
    (targetSubmission: SubmissionDataObject) => {
      localStorage.setItem("selectedMetric", "Dashboard");
      handleRedirectAdmin(
        targetSubmission.repository_link,
        submissions,
        targetSubmission.id,
        "/graph",
        navigate
      );
    },
    [navigate, submissions]
  );

  const handleOpenAssistant = useCallback(
    (targetSubmission: SubmissionDataObject) => {
      navigate("/asistente-ia", {
        state: { repositoryLink: targetSubmission.repository_link },
      });
    },
    [navigate]
  );

  const handleViewAdditionalGraph = useCallback(
    (targetSubmission: SubmissionDataObject) => {
      localStorage.setItem("selectedMetric", "Complejidad");
      handleRedirectAdmin(
        targetSubmission.repository_link,
        submissions,
        targetSubmission.id,
        "/aditionalgraph",
        navigate
      );
    },
    [navigate, submissions]
  );
  const handleViewStudentGraph = useCallback(() => {
    localStorage.setItem("selectedMetric", "Dashboard");
    if (studentSubmission?.repository_link) {
      handleRedirectStudent(
        studentSubmission.repository_link,
        studentSubmission.id,
        navigate
      );
    }
  }, [navigate, studentSubmission]);

  const handleOpenStudentAssistant = useCallback(() => {
    localStorage.setItem("selectedMetric", "AssistantAI");
    navigate("/asistente-ia", {
      state: { repositoryLink: studentSubmission?.repository_link },
    });
  }, [navigate, studentSubmission?.repository_link]);

  return (
    <AssignmentDetailView
      role={role}
      assignment={assignment}
      groupName={groupDetails?.groupName}
      studentSubmission={studentSubmission}
      submissionRepositoryLink={submission?.repository_link}
      linkDialogOpen={linkDialogOpen}
      isCommentDialogOpen={isCommentDialogOpen}
      showIAButton={showIAButton}
      isTaskInProgress={isTaskInProgress}
      loadingSubmissions={loadingSubmissions}
      submissions={submissions}
      studentEmails={studentEmails}
      disableAdditionalGraphs={disableAdditionalGraphs}
      onOpenLinkDialog={handleOpenLinkDialog}
      onCloseLinkDialog={handleCloseLinkDialog}
      onSendGithubLink={sendGithubLink}
      onOpenCommentDialog={handleOpenCommentDialog}
      onCloseCommentDialog={handleCloseCommentDialog}
      onSendComment={sendComment}
      onViewStudentGraph={handleViewStudentGraph}
      onOpenStudentAssistant={handleOpenStudentAssistant}
      onViewGraph={handleViewGraph}
      onOpenAssistant={handleOpenAssistant}
      onViewAdditionalGraph={handleViewAdditionalGraph}
    />
  );
};

export default AssignmentDetailContainer;
