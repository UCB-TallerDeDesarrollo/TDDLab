import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { BackendApiError } from "../../../modules/TDDCycles-Visualization/repository/BackendDto";
import { GetSubmissionsByAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";

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
  const location = useLocation();

  const studentRole = isStudent(role);
  const isTeacherView = role !== "student";

  const repoOwner = searchParams.get("repoOwner") || "defaultOwner";
  const repoName = searchParams.get("repoName") || "defaultRepo";
  const submissionId = isTeacherView
    ? Number(searchParams.get("submissionId")) || 0
    : 0;
  const assignmentId = Number(searchParams.get("assignmentId")) || 0;
  const submissionIdcomments = submissionId;

  const stateSubmissions =
    (location.state as { fetchedSubmissions?: Submission[] } | null)
      ?.fetchedSubmissions;

  const [fetchedSubmissions, setFetchedSubmissions] = useState<Submission[]>(
    stateSubmissions ?? [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

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
  const [error, setError] = useState<string | null>(null);

  const defaultMetric = getDefaultMetric(graphs);

  useEffect(() => {
    if (stateSubmissions?.length) {
      setFetchedSubmissions(stateSubmissions);
    }
  }, [stateSubmissions]);

  useEffect(() => {
    if (!isTeacherView) return;
    if (fetchedSubmissions.length > 0) return;
    if (!assignmentId) return;

    const repo = new SubmissionRepository();
    const useCase = new GetSubmissionsByAssignmentId(repo);
    useCase
      .getSubmissionsByAssignmentId(assignmentId)
      .then((data) => setFetchedSubmissions(data as unknown as Submission[]))
      .catch((err) =>
        console.error("Error loading submissions by assignmentId:", err),
      );
  }, [isTeacherView, assignmentId, fetchedSubmissions.length]);

  useEffect(() => {
    if (!isTeacherView || fetchedSubmissions.length === 0) return;
    const idx = fetchedSubmissions.findIndex((s) => s.id === submissionId);
    if (idx >= 0) setCurrentIndex(idx);
  }, [fetchedSubmissions, submissionId, isTeacherView]);

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
    loadComments().catch((error: unknown) =>
      console.error("Error loading comments:", error),
    );
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

    loadOwnerName().catch((error: unknown) =>
      console.error("Error loading owner name:", error),
    );
  }, [port, repoOwner]);

  useEffect(() => {
    const loadVisualizationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const visualizationData = await fetchTDDVisualizationData(
          port,
          repoOwner,
          repoName,
        );
        setCommitsInfo(visualizationData.commits);
        setCommitsTddCycles(visualizationData.commitsTddCycles);
        setTDDLogsInfo(visualizationData.tddLogs);
      } catch (error) {
        setCommitsInfo(null);
        if (error instanceof BackendApiError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            `Error inesperado al cargar los commits del repositorio ${repoOwner}/${repoName}`,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadVisualizationData().catch((error: unknown) =>
      console.error("Error loading visualization data:", error),
    );
  }, [port, repoOwner, repoName]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = fetchedSubmissions[previousIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(previousSubmission)}&assignmentId=${assignmentId}`, {
        state: { fetchedSubmissions },
      });
      setCurrentIndex(previousIndex);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = fetchedSubmissions[nextIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(nextSubmission)}&assignmentId=${assignmentId}`, {
        state: { fetchedSubmissions },
      });
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
    },
    error,
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
