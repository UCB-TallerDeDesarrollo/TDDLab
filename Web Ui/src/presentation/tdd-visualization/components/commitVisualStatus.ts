import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

export type CommitVisualStatus = "failed" | "success" | "refactor";

export interface CommitVisualDescriptor {
  status: CommitVisualStatus;
  label: string;
  tooltipStatus: string;
  pointStyle: "triangle" | "circle";
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

const STATUS_STYLES: Record<CommitVisualStatus, Omit<CommitVisualDescriptor, "tooltipStatus">> = {
  failed: {
    status: "failed",
    label: "Pruebas fallidas",
    pointStyle: "triangle",
    // Los tonos sólidos mantienen al menos 3:1 de contraste sobre fondo blanco.
    backgroundColor: "#B42318",
    borderColor: "#5F1510",
    borderWidth: 2,
  },
  success: {
    status: "success",
    label: "Pruebas pasadas",
    pointStyle: "circle",
    backgroundColor: "#137333",
    borderColor: "#0B4A20",
    borderWidth: 2,
  },
  refactor: {
    status: "refactor",
    label: "Refactor",
    pointStyle: "circle",
    backgroundColor: "#137333",
    borderColor: "#0B4F8A",
    borderWidth: 4,
  },
};

export function getVisualStatusStyle(status: CommitVisualStatus) {
  return STATUS_STYLES[status];
}

export function isRefactorCommit(message: string): boolean {
  return /\brefactor(\w*)\b/i.test(message);
}

export function getTestExecutionVisualStatus(
  passed: boolean,
  commitMessage = "",
): CommitVisualStatus {
  if (!passed) return "failed";
  if (isRefactorCommit(commitMessage)) return "refactor";
  return "success";
}

export function getCommitVisualStatus(commit: CommitDataObject): CommitVisualStatus {
  const hasFailedTests =
    commit.conclusion === "failure" ||
    !commit.test_count ||
    commit.coverage === null ||
    commit.coverage === undefined;

  if (hasFailedTests) return "failed";
  if (isRefactorCommit(commit.commit.message)) return "refactor";
  return "success";
}

function getMetricsText(commit: CommitDataObject): string {
  const coverage = commit.coverage ?? 0;
  const tests = commit.test_count ?? 0;
  return `${coverage}% de cobertura; ${tests} pruebas`;
}

export function getCommitVisualDescriptor(commit: CommitDataObject): CommitVisualDescriptor {
  const status = getCommitVisualStatus(commit);
  const style = STATUS_STYLES[status];
  const metrics = getMetricsText(commit);
  const statusText = status === "refactor"
    ? "Refactor (pruebas pasadas)"
    : style.label;

  return {
    ...style,
    tooltipStatus: `Estado: ${statusText} (${metrics})`,
  };
}
