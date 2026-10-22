import { useEffect, useState, useMemo, useRef } from "react";
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
  TDDVisualizationData,
} from "../types/tddVisualization.types";

function isStudent(role: string) {
  return role === "student";
}

function getRepoQuery(submission: Submission) {
  const [, , , repoOwner, repoName] = submission.repository_link.split("/");
  return `repoOwner=${repoOwner}&repoName=${repoName}&submissionId=${submission.id}`;
}

const EMPTY_VISUALIZATION_DATA: TDDVisualizationData = {
  commits: [],
  commitsLoadError: false,
  commitsTddCycles: [],
  defaultBranch: null,
  tddLogs: [],
  testDataLoadError: false,
};

const VISUALIZATION_ERROR_DATA: TDDVisualizationData = {
  ...EMPTY_VISUALIZATION_DATA,
  commitsLoadError: true,
  testDataLoadError: true,
};

export function useTDDChartPage({
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
  const fetchedSubmissions: Submission[] = useMemo(() => {
    if (!isTeacherView) {
      return [];
    }

    try {
      const stored = sessionStorage.getItem("teacherSubmissions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error reading teacherSubmissions from sessionStorage:", error);
    }

    const paramSubmissions = searchParams.get("fetchedSubmissions");
    if (paramSubmissions) {
      try {
        const parsed = JSON.parse(paramSubmissions);
        if (Array.isArray(parsed)) {
          return parsed.map((item: Record<string, unknown>) => ({
            id: Number(item.id),
            repository_link: String(item.repository_link || ""),
          }));
        }
      } catch (error) {
        console.error("Error parsing fetchedSubmissions param:", error);
      }
    }

    return [];
  }, [isTeacherView, searchParams]);
  const submissionId = isTeacherView ? Number(searchParams.get("submissionId")) : 0;

  const [currentIndex, setCurrentIndex] = useState(
    isTeacherView
      ? fetchedSubmissions.findIndex((submission) => submission.id === submissionId)
      : 0,
  );

  const prevSubmissionIdRef = useRef(submissionId);
  useEffect(() => {
    if (isTeacherView && fetchedSubmissions.length > 0 && prevSubmissionIdRef.current !== submissionId) {
      prevSubmissionIdRef.current = submissionId;
      const index = fetchedSubmissions.findIndex((submission) => submission.id === submissionId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [isTeacherView, fetchedSubmissions, submissionId]);
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentDataObject[] | null>(null);
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metric, setMetric] = useState<string | null>(null);
  const [visualizationData, setVisualizationData] = useState<TDDVisualizationData>(
    EMPTY_VISUALIZATION_DATA,
  );

  const defaultMetric = "Dashboard";

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
    loadComments().catch((error: unknown) => console.error("Error loading comments:", error));
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

    loadOwnerName().catch((error: unknown) => console.error("Error loading owner name:", error));
  }, [port, repoOwner]);

  useEffect(() => {
    const loadVisualizationData = async () => {
      setLoading(true);
      setVisualizationData(EMPTY_VISUALIZATION_DATA);

      try {
        const data = await fetchTDDVisualizationData(port, repoOwner, repoName);
        setVisualizationData(data);
      } catch (error) {
        console.error("Error obtaining data:", error);
        setVisualizationData(VISUALIZATION_ERROR_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadVisualizationData().catch((error: unknown) => console.error("Error loading visualization data:", error));
  }, [port, repoOwner, repoName]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = fetchedSubmissions[previousIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(previousSubmission)}`);
      setCurrentIndex(previousIndex);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = fetchedSubmissions[nextIndex];
      localStorage.setItem("selectedMetric", defaultMetric);
      navigate(`?${getRepoQuery(nextSubmission)}`);
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
      commitsInfo: visualizationData.commits,
      commitsLoadError: visualizationData.commitsLoadError,
      commitsTddCycles: visualizationData.commitsTddCycles,
      defaultBranch: visualizationData.defaultBranch,
      metric,
      setMetric,
      tddLogsInfo: visualizationData.tddLogs,
      testDataLoadError: visualizationData.testDataLoadError,
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
