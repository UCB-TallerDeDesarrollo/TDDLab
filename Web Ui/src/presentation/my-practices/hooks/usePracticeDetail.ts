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

  const savingSubmission = useRef(false);
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    setSubmissionState("loading");
    fetchSubmissionsByPracticeId(practiceid)
        .then((fetched) => {
          setPracticeSubmissions(fetched);
          const selected = fetched.find((item) => item.userid === userid) || null;
          setSubmission(selected);
          setSubmissionState(selected ? "success" : "empty");
        })
        .catch((err) => {
          console.error("Error fetching practice submissions:", err);
          setSubmissionState("error");
        });
  }, [practiceid, userid, refreshTick]);

  const isTaskInProgress = submission?.status !== "in progress";
  const canStartPractice = submissionState === "empty";
  const canFinishPractice =
      submissionState === "success" && submission?.status === "in progress";

  const createdAt = useMemo(
      () => toDisplayDate(practice?.creation_date),
      [practice?.creation_date]
  );

  const statusLabel = useMemo(
      () =>
          submission?.status === "delivered"
              ? "Finalizado"
              : getDisplayStatus(submission?.status),
      [submission?.status]
  );

  const refreshDetailData = () => setRefreshTick((prev) => prev + 1);

  const openLinkDialog = () => {
    if (canStartPractice && !savingSubmission.current) setLinkDialogOpen(true);
  };
  const closeLinkDialog = () => setLinkDialogOpen(false);
  const openCommentDialog = () => {
    if (canFinishPractice && !savingSubmission.current) setIsCommentDialogOpen(true);
  };
  const closeCommentDialog = () => setIsCommentDialogOpen(false);

  const sendGithubLink = async (repositoryLink: string) => {
    if (!practiceid || !canStartPractice || savingSubmission.current) return;

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

    savingSubmission.current = true;
    setIsSavingSubmission(true);
    try {
      await startPracticeSubmission(data);
      closeLinkDialog();
      refreshDetailData();
    } finally {
      savingSubmission.current = false;
      setIsSavingSubmission(false);
    }
  };

  const sendComment = async (comment: string) => {
    if (!submission || !canFinishPractice || savingSubmission.current) return;

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

    savingSubmission.current = true;
    setIsSavingSubmission(true);
    try {
      await finishPracticeSubmission(submission.id, data);
      closeCommentDialog();
      refreshDetailData();
    } finally {
      savingSubmission.current = false;
      setIsSavingSubmission(false);
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
    canStartPractice,
    canFinishPractice,
    isSavingSubmission,
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