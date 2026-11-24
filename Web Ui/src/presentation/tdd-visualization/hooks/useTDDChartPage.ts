import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  readTeacherSubmissions,
} from "../../../shared/helpers/navigationHandlers";
import { CommentDataObject } from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import {
  createTeacherComment,
  fetchCommentsData,
  fetchOwnerName,
  fetchTDDVisualizationData,
} from "../services/tddVisualization.service";
import {
  CycleReportViewProps,
  Submission,
} from "../types/tddVisualization.types";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { getCommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/repository/getCommitHistoryRepository";

function isStudent(role: string) {
  return role === "student";
}

function getDefaultMetric(graphs: string) {
  return graphs === "graph" ? "Dashboard" : "Complejidad";
}

function getRepoQuery(submission: Submission, assignmentId?: number) {
  const [, , , repoOwner, repoName] = submission.repository_link.split("/");
  const params = new URLSearchParams({
    repoOwner,
    repoName,
    submissionId: submission.id.toString(),
  });

  if (assignmentId && assignmentId > 0) {
    params.set("assignmentId", assignmentId.toString());
  }

  return params.toString();
}

export function useTDDChartPage({
  graphs,
  port,
  role,
  teacher_id,
}: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentRole = isStudent(role);
  const isTeacherView = role !== "student";
  const rawOwner = searchParams.get("repoOwner");
  const rawRepo = searchParams.get("repoName");
  const isQueryFake = searchParams.get("fake") === "true";
  const activePort = useMemo(() => port ?? getCommitHistoryRepository(isQueryFake), [port, isQueryFake]);
  const repoOwner = rawOwner && rawOwner !== "null" ? rawOwner : "defaultOwner";
  const repoName = rawRepo && rawRepo !== "null" ? rawRepo : "defaultRepo";
  const submissionIdcomments = Number.parseInt(searchParams.get("submissionId") || "0");
  const assignmentId = Number.parseInt(searchParams.get("assignmentId") || "0");
  const fetchedSubmissions: Submission[] = isTeacherView
    ? readTeacherSubmissions(assignmentId)
    : [];
  const submissionId = isTeacherView ? Number(searchParams.get("submissionId")) : 0;

  const [currentIndex, setCurrentIndex] = useState(
    isTeacherView
      ? fetchedSubmissions.findIndex((submission) => submission.id === submissionId)
      : 0,
  );
  const [ownerName, setOwnerName] = useState("");
  const [loadedRepo, setLoadedRepo] = useState<{ port: typeof activePort; owner: string; repo: string }>();
  const loading = loadedRepo?.port !== activePort || loadedRepo.owner !== repoOwner || loadedRepo.repo !== repoName;
  const [comments, setComments] = useState<CommentDataObject[] | null>(null);
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metric, setMetric] = useState<string | null>(null);
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(null);
  const [tddLogsInfo, setTDDLogsInfo] = useState<TDDLogEntry[] | null>(null);
  const [commitsTddCycles, setCommitsTddCycles] = useState<CommitCycle[]>([]);
  const [tddLogsError, setTDDLogsError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cyclesError, setCyclesError] = useState(false);

  const defaultMetric = getDefaultMetric(graphs);

  const loadComments = useCallback(async () => {
    try {
      const commentsData = await fetchCommentsData(submissionIdcomments);
      setEmails(commentsData.emails);
      setComments(commentsData.comments);
    } catch (error) {
      console.error("Error obtaining comments:", error);
    }
  }, [submissionIdcomments]);

  useEffect(() => {
    loadComments().catch((error: unknown) => console.error("Error loading comments:", error));
  }, [loadComments]);

  useEffect(() => {
    let active = true;
    const loadOwnerName = async () => {
      try {
        const name = await fetchOwnerName(activePort, repoOwner);
        if (active) setOwnerName(name || repoOwner);
      } catch (error) {
        console.error("Error obtaining owner name:", error);
        if (active) setOwnerName(repoOwner);
      }
    };

    loadOwnerName().catch((error: unknown) => console.error("Error loading owner name:", error));
    return () => {
      active = false;
    };
  }, [activePort, repoOwner]);

  useEffect(() => {
    let active = true;
    const loadVisualizationData = async () => {
      setCyclesError(false);
      setLoadError(false);
      setTDDLogsError(false);
      setCommitsInfo(null);
      setTDDLogsInfo(null);
      setCommitsTddCycles([]);
      try {
        const visualizationData = await fetchTDDVisualizationData(activePort, repoOwner, repoName);
        if (!active) return;
        setCommitsInfo(visualizationData.commits);
        setCommitsTddCycles(visualizationData.commitsTddCycles);
        setTDDLogsInfo(visualizationData.tddLogs);
        setTDDLogsError(Boolean(visualizationData.tddLogsError));
        setLoadError(Boolean(visualizationData.commitsError));
        setCyclesError(Boolean(visualizationData.cyclesError));
      } catch (error) {
        console.error("Error obtaining data:", error);
        if (active) {
          setLoadError(true);
        }
      } finally {
        if (active) {
          setLoadedRepo({ port: activePort, owner: repoOwner, repo: repoName });
        }
      }
    };

    loadVisualizationData().catch((error: unknown) => console.error("Error loading visualization data:", error));
    return () => {
      active = false;
    };
  }, [activePort, repoOwner, repoName]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = fetchedSubmissions[previousIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(previousSubmission, assignmentId)}`);
      setCurrentIndex(previousIndex);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = fetchedSubmissions[nextIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(nextSubmission, assignmentId)}`);
      setCurrentIndex(nextIndex);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTeacherComment({
        submission_id: submissionIdcomments,
        teacher_id,
        content: feedback,
      });
      setFeedback("");
      await loadComments();
    } catch (error) {
      console.error("Error al enviar la retroalimentación:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    chartsState: {
      commitsInfo,
      commitsTddCycles,
      metric,
      setMetric,
      tddLogsInfo,
      tddLogsError,
      loadError,
    },
    comments,
    currentIndex,
    emails,
    feedback,
    fetchedSubmissions,
    goToNextStudent,
    goToPreviousStudent,
    handleSubmitFeedback,
    isSubmitting,
    isStudent: studentRole,
    activePort,
    loading,
    cyclesError,
    ownerName,
    repoName,
    role,
    setFeedback,
  };
}
