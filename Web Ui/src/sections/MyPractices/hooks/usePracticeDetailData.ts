import { useEffect, useMemo, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { CreatePracticeSubmission } from "../../../modules/PracticeSubmissions/Application/CreatePracticeSubmission";
import { FinishPracticeSubmission } from "../../../modules/PracticeSubmissions/Application/FinishPracticeSubmission";
import { GetPracticeSubmissionsByPracticeId } from "../../../modules/PracticeSubmissions/Application/getPracticeSubmissionByPracticeId";
import { GetPracticeSubmissionByUserandPracticeSubmissionId } from "../../../modules/PracticeSubmissions/Application/getPracticeSubmissionByUserIdAnPracticeSubmissionId";
import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../../../modules/PracticeSubmissions/Domain/PracticeSubmissionInterface";
import PracticeSubmissionRepository from "../../../modules/PracticeSubmissions/Repository/PracticeSubmissionRepository";
import { GetPracticeById } from "../../../modules/Practices/application/GetPracticeById";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import PracticesRepository from "../../../modules/Practices/repository/PracticesRepository";
import { formatDate } from "../../../utils/dateUtils";
import { handleRedirectStudent } from "../../Shared/handlers";

type ViewState = "loading" | "error" | "empty" | "success";

function getDisplayStatus(status: string | undefined) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "in progress":
      return "En progreso";
    case "delivered":
      return "Enviado";
    case undefined:
      return "Pendiente";
    default:
      return status;
  }
}

function toDisplayDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const normalized = value instanceof Date ? value.toISOString() : value.toString();
  return formatDate(normalized);
}

interface UsePracticeDetailDataProps {
  userid: number;
  practiceid: number;
  navigate: NavigateFunction;
}

export function usePracticeDetailData({
  userid,
  practiceid,
  navigate,
}: Readonly<UsePracticeDetailDataProps>) {
  const [practiceState, setPracticeState] = useState<ViewState>("loading");
  const [submissionState, setSubmissionState] = useState<ViewState>("loading");

  const [practice, setPractice] = useState<PracticeDataObject | null>(null);
  const [submission, setSubmission] = useState<PracticeSubmissionDataObject | null>(null);
  const [practiceSubmissions, setPracticeSubmissions] = useState<
    PracticeSubmissionDataObject[]
  >([]);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPractice = async () => {
      const practiceRepository = new PracticesRepository();
      const getPracticeDetail = new GetPracticeById(practiceRepository);

      setPracticeState("loading");

      try {
        const fetchedPractice = await getPracticeDetail.obtainAssignmentDetail(practiceid);
        if (!fetchedPractice) {
          setPractice(null);
          setPracticeState("empty");
          return;
        }

        setPractice(fetchedPractice);
        setPracticeState("success");
      } catch (error) {
        console.error("Error fetching practice:", error);
        setPracticeState("error");
      }
    };

    fetchPractice();
  }, [practiceid]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const practiceSubmissionRepository = new PracticeSubmissionRepository();
      const getPracticeSubmissionsByAssignmentId =
        new GetPracticeSubmissionsByPracticeId(practiceSubmissionRepository);

      setSubmissionState("loading");

      try {
        const fetchedSubmissions =
          await getPracticeSubmissionsByAssignmentId.getPracticeSubmissionsByPracticeId(
            practiceid
          );

        setPracticeSubmissions(fetchedSubmissions);

        const selectedSubmission =
          fetchedSubmissions.find((item) => item.userid === userid) || fetchedSubmissions[0] || null;

        setSubmission(selectedSubmission);
        setSubmissionState(selectedSubmission ? "success" : "empty");
      } catch (error) {
        console.error("Error fetching PracticeSubmissionByPracticeAndUser:", error);
        setSubmissionState("error");
      }
    };

    fetchSubmissions();
  }, [practiceid, userid]);

  useEffect(() => {
    const fetchUserSubmission = async () => {
      if (!practiceid || !userid || userid === -1) {
        return;
      }

      const practiceSubmissionRepository = new PracticeSubmissionRepository();
      const practiceSubmissionData =
        new GetPracticeSubmissionByUserandPracticeSubmissionId(
          practiceSubmissionRepository
        );

      try {
        const fetchedPracticeSubmission =
          await practiceSubmissionData.getPracticeSubmisssionByUserandPracticeSubmissionId(
            practiceid,
            userid
          );

        setSubmission(fetchedPracticeSubmission);
      } catch (error) {
        console.error("Error fetching submission:", error);
      }
    };

    fetchUserSubmission();
  }, [practiceid, userid]);

  const isTaskInProgress = submission?.status !== "in progress";

  const createdAt = useMemo(
    () => toDisplayDate(practice?.creation_date),
    [practice?.creation_date]
  );

  const statusLabel = useMemo(
    () => getDisplayStatus(submission?.status),
    [submission?.status]
  );

  const openLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    window.location.reload();
  };

  const openCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const closeCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const sendGithubLink = async (repositoryLink: string) => {
    if (!practiceid) {
      return;
    }

    const practiceSubmissionsRepository = new PracticeSubmissionRepository();
    const createPracticeSubmission = new CreatePracticeSubmission(
      practiceSubmissionsRepository
    );
    const startDate = new Date();
    const start_date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    const practiceSubmissionData: PracticeSubmissionCreationObject = {
      practiceid,
      userid,
      status: "in progress",
      repository_link: repositoryLink,
      start_date,
    };

    await createPracticeSubmission.createPracticeSubmission(practiceSubmissionData);
    closeLinkDialog();
  };

  const sendComment = async (comment: string) => {
    if (!submission) {
      return;
    }

    const submissionRepository = new PracticeSubmissionRepository();
    const finishSubmission = new FinishPracticeSubmission(submissionRepository);
    const endDate = new Date();
    const end_date = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    const submissionData: PracticeSubmissionUpdateObject = {
      id: submission.id,
      status: "delivered",
      end_date,
      comment,
    };

    await finishSubmission.finishSubmission(submission.id, submissionData);
    closeCommentDialog();
    window.location.reload();
  };

  const redirectToGraph = () => {
    if (!submission?.repository_link) {
      return;
    }

    localStorage.setItem("selectedMetric", "Dashboard");
    handleRedirectStudent(submission.repository_link, submission.id, navigate);
  };

  return {
    practiceState,
    submissionState,
    practice,
    submission,
    practiceSubmissions,
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
  };
}
