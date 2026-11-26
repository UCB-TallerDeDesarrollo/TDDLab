
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  readTeacherSubmissions,
} from "../../../shared/helpers/navigationHandlers";

import type {
  CommentDataObject,
} from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

import {
  createTeacherComment,
  fetchCommentsData,
  fetchOwnerName,
} from "../services/tddVisualization.service";

import type {
  CycleReportViewProps,
  Submission,
} from "../types/tddVisualization.types";

import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type {
  CommitCycle,
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

import type {
  TDDLogEntry,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import type {
  CommitHistoryRepositoryBranchSupport,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterfaceBranchSupport";

import { CommitHistoryAdapterBranchSupport } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapterBranchSupport";

import { GetCommitsOfRepoBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepoBranchSupport";

import { GetCommitTddCycleBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetCommitTddCycleBranchSupport";

import { GetProjectBranchesBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetProjectBranchesBranchSupport";

import { GetTestExecutionsBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetTestExecutionsBranchSupport";

// =====================================================
// REPOSITORIO BRANCH SUPPORT
// =====================================================

const defaultBranchRepository =
  new CommitHistoryAdapterBranchSupport();

type BranchAwarePageProps = CycleReportViewProps & {
  branchPort?: CommitHistoryRepositoryBranchSupport;
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function isStudent(role: string) {
  return role === "student";
}

function getDefaultMetric(graphs: string) {
  return graphs === "graph"
    ? "Dashboard"
    : "Complejidad";
}

function getRepoQuery(
  submission: Submission,
  assignmentId?: number
) {
  const [, , , repoOwner, repoName] =
    submission.repository_link.split("/");

  const params = new URLSearchParams({
    repoOwner,
    repoName,
    submissionId: submission.id.toString(),
  });

  if (assignmentId && assignmentId > 0) {
    params.set(
      "assignmentId",
      assignmentId.toString()
    );
  }

  return params.toString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error desconocido.";
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useTDDChartPage({
  graphs,
  port,
  branchPort,
  role,
  teacher_id,
}: Readonly<BranchAwarePageProps>) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const studentRole = isStudent(role);
  const isTeacherView = role !== "student";

  // ===================================================
  // PARÁMETROS DEL REPOSITORIO
  // ===================================================

  const repoOwner =
    searchParams.get("repoOwner") || "";

  const repoName =
    searchParams.get("repoName") || "";

  const submissionIdcomments = Number.parseInt(
    searchParams.get("submissionId") || "0",
    10
  );

  const assignmentId = Number.parseInt(
    searchParams.get("assignmentId") || "0",
    10
  );

  const fetchedSubmissions: Submission[] =
    isTeacherView
      ? readTeacherSubmissions(assignmentId)
      : [];

  const submissionId = isTeacherView
    ? Number(searchParams.get("submissionId"))
    : 0;

  const branchRepository =
    branchPort ?? defaultBranchRepository;

  // ===================================================
  // ESTADOS ORIGINALES
  // ===================================================

  const [currentIndex, setCurrentIndex] =
    useState(
      isTeacherView
        ? fetchedSubmissions.findIndex(
            (submission) =>
              submission.id === submissionId
          )
        : 0
    );

  const [ownerName, setOwnerName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [comments, setComments] =
    useState<CommentDataObject[] | null>(null);

  const [emails, setEmails] =
    useState<Record<number, string>>({});

  const [feedback, setFeedback] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [metric, setMetric] =
    useState<string | null>(null);

  const [commitsInfo, setCommitsInfo] =
    useState<CommitDataObject[] | null>(null);

  const [tddLogsInfo, setTDDLogsInfo] =
    useState<TDDLogEntry[] | null>(null);

  const [commitsTddCycles, setCommitsTddCycles] =
    useState<CommitCycle[]>([]);

  // ===================================================
  // ESTADOS BRANCH SUPPORT
  // ===================================================

  const [availableBranches, setAvailableBranches] =
    useState<string[]>([]);

  // "" representa la rama predeterminada del backend.
  // No representa "todas las ramas".

  const [selectedBranch, setSelectedBranch] =
    useState<string>("");

  const [loadingBranches, setLoadingBranches] =
    useState(true);

  const [branchError, setBranchError] =
    useState<string | null>(null);

  const [visualizationError, setVisualizationError] =
    useState<string | null>(null);

  const defaultMetric = getDefaultMetric(graphs);

  // ===================================================
  // COMENTARIOS
  // ===================================================

  const loadComments = async () => {
    try {
      const commentsData =
        await fetchCommentsData(
          submissionIdcomments
        );

      setEmails(commentsData.emails);
      setComments(commentsData.comments);
    } catch (error) {
      console.error(
        "Error obtaining comments:",
        error
      );
    }
  };

  useEffect(() => {
    let active = true;

    setComments(null);
    setEmails({});

    fetchCommentsData(submissionIdcomments)
      .then((commentsData) => {
        if (!active) return;

        setEmails(commentsData.emails);
        setComments(commentsData.comments);
      })
      .catch((error: unknown) => {
        if (active) {
          console.error(
            "Error loading comments:",
            error
          );
        }
      });

    return () => {
      active = false;
    };
  }, [submissionIdcomments]);

  // ===================================================
  // NOMBRE DEL PROPIETARIO
  // ===================================================

  useEffect(() => {
    let active = true;

    setOwnerName("");

    fetchOwnerName(port, repoOwner)
      .then((name) => {
        if (active) {
          setOwnerName(name);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error(
            "Error obtaining owner name:",
            error
          );
        }
      });

    return () => {
      active = false;
    };
  }, [port, repoOwner]);

  // ===================================================
  // CONSULTAR RAMAS DISPONIBLES
  // ===================================================

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      setLoadingBranches(true);
      setBranchError(null);
      setAvailableBranches([]);

      if (!repoOwner || !repoName) {
        setBranchError(
          "No se ha especificado un repositorio válido."
        );
        setLoadingBranches(false);
        return;
      }

      try {
        const useCase =
          new GetProjectBranchesBranchSupport(
            branchRepository
          );

        const branches = await useCase.execute(
          repoOwner,
          repoName
        );

        if (!active) return;

        const uniqueBranches = [
          ...new Set(
            branches.filter(
              (branch) =>
                typeof branch === "string" &&
                branch.trim().length > 0
            )
          ),
        ];

        setAvailableBranches(uniqueBranches);
      } catch (error) {
        if (!active) return;

        console.error(
          "Error obtaining branches:",
          error
        );

        setBranchError(
          "No fue posible obtener las ramas: " +
          getErrorMessage(error)
        );
      } finally {
        if (active) {
          setLoadingBranches(false);
        }
      }
    };

    void loadBranches();

    return () => {
      active = false;
    };
  }, [branchRepository, repoOwner, repoName]);

  // ===================================================
  // SELECCIONAR RAMA
  // ===================================================

  const handleBranchChange = (branch: string) => {
    if (
      branch !== "" &&
      branch !== "all" &&
      !availableBranches.includes(branch)
    ) {
      return;
    }

    setSelectedBranch(branch);
    setVisualizationError(null);
  };

  // ===================================================
  // OBTENER COMMITS, CICLOS TDD Y LOGS
  // ===================================================

  useEffect(() => {
    let active = true;

    const loadVisualizationData = async () => {
      setLoading(true);
      setVisualizationError(null);

      setCommitsInfo(null);
      setCommitsTddCycles([]);
      setTDDLogsInfo(null);

      if (!repoOwner || !repoName) {
        setVisualizationError(
          "No se ha especificado un repositorio válido."
        );
        setLoading(false);
        return;
      }

      try {
        const commitsUseCase =
          new GetCommitsOfRepoBranchSupport(
            branchRepository
          );

        const cyclesUseCase =
          new GetCommitTddCycleBranchSupport(
            branchRepository
          );

        const executionsUseCase =
          new GetTestExecutionsBranchSupport(
            branchRepository
          );

        const branch =
          selectedBranch || undefined;

        const [
          branchCommits,
          branchCycles,
          executions,
        ] = await Promise.all([
          commitsUseCase.execute(
            repoOwner,
            repoName,
            branch
          ),

          cyclesUseCase.execute(
            repoOwner,
            repoName,
            branch
          ),

          executionsUseCase.execute(
            repoOwner,
            repoName,
            branch
          ),
        ]);

        if (!active) return;

        const legacyCommits: CommitDataObject[] =
          branchCommits.map((commit) => ({
            ...commit,

            // Las gráficas antiguas esperan number.
            // "unknown" distingue datos no disponibles.
            coverage: commit.coverage as number,

            stats: {
              ...commit.stats,
              total: commit.stats.total ?? 0,
              additions: commit.stats.additions ?? 0,
              deletions: commit.stats.deletions ?? 0,
            },

            commit: {
              ...commit.commit,
              date:
                commit.commit.date instanceof Date
                  ? commit.commit.date
                  : new Date(commit.commit.date),
            },
          }));

        const legacyCycles: CommitCycle[] =
          branchCycles.map((cycle) => ({
            sha: cycle.sha,
            url: cycle.url,
            tddCycle: cycle.tddCycle,
          }));

        setCommitsInfo(legacyCommits);
        setCommitsTddCycles(legacyCycles);

        const legacyLogs: TDDLogEntry[] =
          executions.map((run, index) => ({
            numPassedTests: run.passed_tests,
            failedTests: run.failed_tests,
            numTotalTests: run.total_tests,
            timestamp:
              run.timestamp ||
              new Date(run.executed_at).getTime(),
            success: run.success,
            testId: run.testId ?? index + 1,
          }));

        setTDDLogsInfo(legacyLogs);
      } catch (error) {
        if (!active) return;

        console.error(
          "Error obtaining visualization data:",
          error
        );

        setVisualizationError(
          "No se pudieron cargar las gráficas: " +
          getErrorMessage(error)
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadVisualizationData();

    return () => {
      active = false;
    };
  }, [
    port,
    branchRepository,
    repoOwner,
    repoName,
    selectedBranch,
  ]);

  // ===================================================
  // SINCRONIZAR NAVEGACIÓN ENTRE ESTUDIANTES
  // ===================================================

  useEffect(() => {
    if (!isTeacherView) return;

    const submissions =
      readTeacherSubmissions(assignmentId);

    const index = submissions.findIndex(
      (submission) =>
        submission.id === submissionId
    );

    setCurrentIndex(index);
  }, [
    assignmentId,
    submissionId,
    isTeacherView,
  ]);

  // ===================================================
  // NAVEGAR AL ESTUDIANTE ANTERIOR
  // ===================================================

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;

      const previousSubmission =
        fetchedSubmissions[previousIndex];

      localStorage.setItem(
        "selectedMetric",
        defaultMetric
      );

      setSelectedBranch("");

      navigate(
        `?${getRepoQuery(
          previousSubmission,
          assignmentId
        )}`
      );

      setCurrentIndex(previousIndex);
    }
  };

  // ===================================================
  // NAVEGAR AL ESTUDIANTE SIGUIENTE
  // ===================================================

  const goToNextStudent = () => {
    if (
      currentIndex <
      fetchedSubmissions.length - 1
    ) {
      const nextIndex = currentIndex + 1;

      const nextSubmission =
        fetchedSubmissions[nextIndex];

      localStorage.setItem(
        "selectedMetric",
        defaultMetric
      );

      setSelectedBranch("");

      navigate(
        `?${getRepoQuery(
          nextSubmission,
          assignmentId
        )}`
      );

      setCurrentIndex(nextIndex);
    }
  };

  // ===================================================
  // ENVIAR RETROALIMENTACIÓN
  // ===================================================

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
      console.error(
        "Error al enviar la retroalimentación:",
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================================================
  // VALORES EXPUESTOS A LA PÁGINA
  // ===================================================

  return {
    chartsState: {
      commitsInfo,
      commitsTddCycles,
      metric,
      setMetric,
      tddLogsInfo,
    },

    availableBranches,
    selectedBranch,
    handleBranchChange,
    loadingBranches,
    branchError,
    visualizationError,

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
