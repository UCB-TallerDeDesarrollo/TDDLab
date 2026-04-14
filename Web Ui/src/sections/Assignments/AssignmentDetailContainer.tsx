import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../modules/Submissions/Aplication/createSubmission";
import {
  SubmissionCreationObject,
  SubmissionDataObject,
  SubmissionUpdateObject,
} from "../../modules/Submissions/Domain/submissionInterfaces";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { FinishSubmission } from "../../modules/Submissions/Aplication/finishSubmission";
import { AssignmentDetailView } from "./AssignmentDetailView";
import {
  useAssignmentDetail,
  useAssignmentSubmissions,
  useFeatureFlagEnabled,
  useGroupDetail,
  useStudentSubmission,
  useSubmissionByUserAndAssignment,
} from "./hooks/useAssignmentDetailData";

import {
  handleRedirectAdmin,
  handleRedirectStudent,
} from "../Shared/handlers.ts";

export interface AssignmentDetailProps {
  role: string;
  userid: number;
}

function isStudent(role: string) {
  return role === "student";
}

const AssignmentDetailContainer: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
}) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [studentEmails, setStudentEmails] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  const usersRepository = useMemo(() => new UsersRepository(), []);
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
  const missingUserIds = useMemo(() => {
    const uniqueIds = new Set(submissions.map((item) => item.userid));
    return Array.from(uniqueIds).filter(
      (studentId) => studentEmails[studentId] === undefined
    );
  }, [studentEmails, submissions]);

  useEffect(() => {
    const loadStudentEmails = async () => {
      if (missingUserIds.length === 0) {
        return;
      }

      try {
        const entries = await Promise.all(
          missingUserIds.map(async (studentId) => {
            const student = await usersRepository.getUserById(studentId);
            return [studentId, student.email] as const;
          })
        );

        setStudentEmails((prev) => {
          const next = { ...prev };
          entries.forEach(([studentId, email]) => {
            next[studentId] = email;
          });
          return next;
        });
      } catch (error) {
        console.error("Error fetching student emails:", error);
      }
    };

    loadStudentEmails();
  }, [missingUserIds, usersRepository]);

  const refreshSubmissionData = useCallback(async () => {
    await Promise.all([
      refreshSubmissions(),
      refreshStudentSubmission(),
      refreshSubmission(),
    ]);
  }, [refreshSubmissions, refreshStudentSubmission, refreshSubmission]);

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentid) {
      const submissionsRepository = new SubmissionRepository();
      const createSubmission = new CreateSubmission(submissionsRepository);
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const submissionData: SubmissionCreationObject = {
        assignmentid: assignmentid,
        userid: userid,
        status: "in progress",
        repository_link: repository_link,
        start_date: start_date,
      };
      await createSubmission.createSubmission(submissionData);
      await refreshSubmissionData();
      handleCloseLinkDialog();
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string) => {
    if (submission) {
      const submissionRepository = new SubmissionRepository();
      const finishSubmission = new FinishSubmission(submissionRepository);
      const endDate = new Date();
      const end_date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const submissionData: SubmissionUpdateObject = {
        id: submission?.id,
        status: "delivered",
        end_date: end_date,
        comment: comment,
      };
      await finishSubmission.finishSubmission(submission.id, submissionData);
      await refreshSubmissionData();
      handleCloseLinkDialog();
    }
    handleCloseCommentDialog();
  };

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
      onSendGithubLink={handleSendGithubLink}
      onOpenCommentDialog={handleOpenCommentDialog}
      onCloseCommentDialog={handleCloseCommentDialog}
      onSendComment={handleSendComment}
      onViewStudentGraph={handleViewStudentGraph}
      onOpenStudentAssistant={handleOpenStudentAssistant}
      onViewGraph={handleViewGraph}
      onOpenAssistant={handleOpenAssistant}
      onViewAdditionalGraph={handleViewAdditionalGraph}
    />
  );
};

export default AssignmentDetailContainer;
