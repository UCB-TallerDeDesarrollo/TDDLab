import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

function isStudent(role: string) {
  return role === "student";
}

function getDefaultMetric(graphs: string) {
  return graphs === "graph" ? "Dashboard" : "Complejidad";
}

function getRepoQuery(submission: Submission) {
  const [, , , repoOwner, repoName] = submission.repository_link.split("/");
  return `repoOwner=${repoOwner}&repoName=${repoName}&submissionId=${submission.id}`;
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
  const repoOwner = String(searchParams.get("repoOwner")) || "defaultOwner";
  const repoName = String(searchParams.get("repoName")) || "defaultRepo";
  const submissionIdcomments = Number.parseInt(searchParams.get("submissionId") || "0");
  const fetchedSubmissions: Submission[] = isTeacherView
    ? JSON.parse(searchParams.get("fetchedSubmissions") || "[]")
    : [];
  const submissionId = isTeacherView ? Number(searchParams.get("submissionId")) : 0;

  const [currentIndex, setCurrentIndex] = useState(
    isTeacherView
      ? fetchedSubmissions.findIndex((submission) => submission.id === submissionId)
      : 0,
  );
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentDataObject[] | null>(null);
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metric, setMetric] = useState<string | null>(null);
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(null);
  const [tddLogsInfo, setTDDLogsInfo] = useState<TDDLogEntry[] | null>(null);
  const [commitsTddCycles, setCommitsTddCycles] = useState<CommitCycle[]>([]);

  const defaultMetric = getDefaultMetric(graphs);

  const loadComments = async () => {
    try {
      const commentsData = await fetchCommentsData(submissionIdcomments);
      setEmails(commentsData.emails);
      setComments(commentsData.comments);
    } catch (error) {
      console.error("Error obtaining comments:", error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [submissionIdcomments]);

  useEffect(() => {
    const loadOwnerName = async () => {
      try {
        const name = await fetchOwnerName(port, repoOwner);
        setOwnerName(name);
      } catch (error) {
        console.error("Error obtaining owner name:", error);
      }
    };

    loadOwnerName();
  }, [port, repoOwner]);

  useEffect(() => {
    const loadVisualizationData = async () => {
      setLoading(true);
      try {
        const visualizationData = await fetchTDDVisualizationData(port, repoOwner, repoName);
        setCommitsInfo(visualizationData.commits);
        setCommitsTddCycles(visualizationData.commitsTddCycles);
        setTDDLogsInfo(visualizationData.tddLogs);
      } catch (error) {
        console.error("Error obtaining data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVisualizationData();
  }, [port, repoOwner, repoName]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = fetchedSubmissions[previousIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(
        `?${getRepoQuery(previousSubmission)}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`,
      );
      setCurrentIndex(previousIndex);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = fetchedSubmissions[nextIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(
        `?${getRepoQuery(nextSubmission)}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`,
      );
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
      loadComments();
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
    loading,
    ownerName,
    repoName,
    role,
    setFeedback,
  };
}
