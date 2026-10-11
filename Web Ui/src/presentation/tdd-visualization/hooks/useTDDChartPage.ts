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
import { parseGithubRepositoryUrl } from "../../../shared/helpers/githubRepository";

function isStudent(role: string) {
  return role === "student";
}

function getDefaultMetric(graphs: string) {
  return graphs === "graph" ? "Dashboard" : "Complejidad";
}

function getRepoQuery(submission: Submission): string | null {
  const repository = parseGithubRepositoryUrl(submission.repository_link);
  if (!repository) return null;
  return `repoOwner=${encodeURIComponent(repository.owner)}&repoName=${encodeURIComponent(repository.repoName)}&submissionId=${submission.id}`;
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
  const queryRepoOwner = searchParams.get("repoOwner") || "";
  const queryRepoName = searchParams.get("repoName") || "";
  const submissionIdcomments = Number.parseInt(searchParams.get("submissionId") || "0");
  const fetchedSubmissions: Submission[] = isTeacherView
    ? JSON.parse(searchParams.get("fetchedSubmissions") || "[]")
    : [];
  const submissionId = isTeacherView ? Number(searchParams.get("submissionId")) : 0;
  const selectedSubmission = isTeacherView
    ? fetchedSubmissions.find((submission) => submission.id === submissionId)
    : undefined;
  const selectedRepository = parseGithubRepositoryUrl(selectedSubmission?.repository_link);
  const queryRepository = parseGithubRepositoryUrl(
    queryRepoOwner && queryRepoName
      ? `https://github.com/${queryRepoOwner}/${queryRepoName}`
      : "",
  );
  const repoOwner = isTeacherView ? selectedRepository?.owner || "" : queryRepository?.owner || "";
  const repoName = isTeacherView ? selectedRepository?.repoName || "" : queryRepository?.repoName || "";

  const currentIndex = isTeacherView
    ? fetchedSubmissions.findIndex((submission) => submission.id === submissionId)
    : 0;
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
  const repositoryIsValid = Boolean(
    repoOwner && repoName,
  );

  const defaultMetric = getDefaultMetric(graphs);

  const loadComments = async (isActive: () => boolean = () => true) => {
    try {
      const commentsData = await fetchCommentsData(submissionIdcomments);
      if (isActive()) {
        setEmails(commentsData.emails);
        setComments(commentsData.comments);
      }
    } catch (error) {
      console.error("Error obtaining comments:", error);
    }
  };

  useEffect(() => {
    let active = true;
    setComments(null);
    setEmails({});
    loadComments(() => active).catch((error: unknown) => console.error("Error loading comments:", error));
    return () => { active = false; };
  }, [submissionIdcomments]);

  useEffect(() => {
    let active = true;
    setOwnerName("");
    if (!repositoryIsValid) return () => { active = false; };
    const loadOwnerName = async () => {
      try {
        const name = await fetchOwnerName(port, repoOwner);
        if (active) setOwnerName(name);
      } catch (error) {
        console.error("Error obtaining owner name:", error);
      }
    };

    loadOwnerName().catch((error: unknown) => console.error("Error loading owner name:", error));
    return () => { active = false; };
  }, [port, repoOwner, repositoryIsValid]);

  useEffect(() => {
    let active = true;
    setCommitsInfo(null);
    setCommitsTddCycles([]);
    setTDDLogsInfo(null);
    if (!repositoryIsValid) {
      setLoading(false);
      return () => { active = false; };
    }
    const loadVisualizationData = async () => {
      setLoading(true);
      try {
        const visualizationData = await fetchTDDVisualizationData(port, repoOwner, repoName);
        if (active) {
          setCommitsInfo(visualizationData.commits);
          setCommitsTddCycles(visualizationData.commitsTddCycles);
          setTDDLogsInfo(visualizationData.tddLogs);
        }
      } catch (error) {
        console.error("Error obtaining data:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadVisualizationData().catch((error: unknown) => console.error("Error loading visualization data:", error));
    return () => { active = false; };
  }, [port, repoOwner, repoName, repositoryIsValid]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = fetchedSubmissions[previousIndex];
      const repoQuery = getRepoQuery(previousSubmission);
      if (!repoQuery) return;
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${repoQuery}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = fetchedSubmissions[nextIndex];
      const repoQuery = getRepoQuery(nextSubmission);
      if (!repoQuery) return;
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${repoQuery}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`);
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
    repositoryIsValid,
    loading,
    ownerName,
    repoName,
    role,
    setFeedback,
  };
}
