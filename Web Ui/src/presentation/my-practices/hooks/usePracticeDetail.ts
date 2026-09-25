import { useEffect, useMemo, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import {
  fetchPracticeById,
  fetchSubmissionsByPracticeId,
  startPracticeSubmission,
  finishPracticeSubmission,
} from "../services";
import {
  PracticeDataObject,
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
  ViewState,
} from "../types";
import {
  getDisplayStatus,
  redirectStudentToGraph,
  toDisplayDate,
} from "../services/practiceDetail.service";

interface UsePracticeDetailProps {
  userid: number;
  practiceid: number;
  navigate: NavigateFunction;
}

export function usePracticeDetail({
  userid,
  practiceid,
  navigate,
}: Readonly<UsePracticeDetailProps>) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [uiMessage, setUiMessage] = useState<string | null>(null);
  const [practiceState, setPracticeState] = useState<ViewState>("loading");
  const [submissionState, setSubmissionState] = useState<ViewState>("loading");

  const [practice, setPractice] = useState<PracticeDataObject | null>(null);
  const [submission, setSubmission] = useState<PracticeSubmissionDataObject | null>(null);
  const [practiceSubmissions, setPracticeSubmissions] = useState<PracticeSubmissionDataObject[]>([]);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const actionLockRef = useRef(false);

  // 1. Guardián para la práctica
  useEffect(() => {
    if (!practiceid || Number.isNaN(practiceid)) {
      setPractice(null);
      setPracticeState("empty");
      return;
    }

    setPracticeState("loading");
    fetchPracticeById(practiceid)
      .then((fetched) => {
        if (!fetched) {
          setPractice(null);
          setPracticeState("empty");
          return;
        }
        setPractice(fetched);
        setPracticeState("success");
      })
      .catch((err) => {
        console.error("Error fetching practice:", err);
        setPracticeState("error");
      });
  }, [practiceid, refreshTick]);

  // 2. Guardián para las entregas (useEffect corregido)
  useEffect(() => {
    if (!userid || userid <= 0 || !practiceid || Number.isNaN(practiceid)) {
      setSubmission(null);
      setPracticeSubmissions([]);
      setSubmissionState("empty");
      return;
    }

    setSubmissionState("loading");
    fetchSubmissionsByPracticeId(practiceid)
      .then((fetched) => {
        const safeFetched = Array.isArray(fetched) ? fetched : [];
        setPracticeSubmissions(safeFetched);
        const selected = safeFetched.find((item) => item.userid === userid) || null;
        setSubmission(selected);
        setSubmissionState(selected ? "success" : "empty");
      })
      .catch((err) => {
        console.error("Error fetching practice submissions:", err);
        setSubmissionState("error");
      });
  }, [practiceid, userid, refreshTick]);

  const isTaskInProgress = submission?.status !== "in progress";

  // 3. Memorizaciones defensivas para evitar que el render falle
  const createdAt = useMemo(() => {
    if (!practice?.creation_date) return "";
    return toDisplayDate(practice.creation_date);
  }, [practice?.creation_date]);

  const statusLabel = useMemo(() => {
    if (!submission?.status) return "Sin estado";
    return getDisplayStatus(submission.status);
  }, [submission?.status]);

  const refreshDetailData = () => setRefreshTick((prev) => prev + 1);

  const openLinkDialog = () => setLinkDialogOpen(true);
  const closeLinkDialog = () => setLinkDialogOpen(false);
  const openCommentDialog = () => setIsCommentDialogOpen(true);
  const closeCommentDialog = () => setIsCommentDialogOpen(false);

  const sendGithubLink = async (repositoryLink: string) => {
    if (!practiceid || !userid) return;
    if (!practiceid || actionLockRef.current) return;

    actionLockRef.current = true;
    setIsActionLoading(true);
    try {
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );

      const data: PracticeSubmissionCreationObject = {
        practiceid,
        userid,
        status: "in progress",
        repository_link: repositoryLink,
        start_date,
      };

      await startPracticeSubmission(data);
      closeLinkDialog();
      refreshDetailData();
    } catch (err) {
      console.error("Error starting practice submission:", err);
      setUiMessage("No se pudo iniciar la práctica. Intenta nuevamente.");
    } finally {
      actionLockRef.current = false;
      setIsActionLoading(false);
    }
  };

  const sendComment = async (comment: string) => {
    if (!submission || actionLockRef.current) return;

    actionLockRef.current = true;
    setIsActionLoading(true);
    try {
      const endDate = new Date();
      const end_date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      const data: PracticeSubmissionUpdateObject = {
        id: submission.id,
        status: "delivered",
        end_date,
        comment,
      };

      await finishPracticeSubmission(submission.id, data);
      closeCommentDialog();
      refreshDetailData();
    } catch (err) {
      console.error("Error finishing practice submission:", err);
      setUiMessage("No se pudo finalizar la práctica. Intenta nuevamente.");
    } finally {
      actionLockRef.current = false;
      setIsActionLoading(false);
    }
  };

  const redirectToGraph = () => {
    if (!submission?.repository_link) return;
    localStorage.setItem("selectedMetric", "Dashboard");
    redirectStudentToGraph(
      submission.repository_link,
      submission.id,
      navigate,
      setUiMessage
    );
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
    isActionLoading,
    linkDialogOpen,
    isCommentDialogOpen,
    openLinkDialog,
    closeLinkDialog,
    sendGithubLink,
    openCommentDialog,
    closeCommentDialog,
    sendComment,
    redirectToGraph,
    uiMessage,
    closeUiMessage: () => setUiMessage(null),
  };
}
