import { createSearchParams, NavigateFunction } from "react-router-dom";
import { formatDate } from "../../../utils/dateUtils";
import { parseGithubRepositoryUrl } from "../../../shared/helpers/githubRepository";

export function getDisplayStatus(status: string | undefined): string {
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

export function toDisplayDate(value: Date | string | null | undefined): string {
  if (!value) return "N/A";
  const normalized = value instanceof Date ? value.toISOString() : value.toString();
  return formatDate(normalized);
}

export function redirectStudentToGraph(
  link: string,
  submissionId: number,
  navigate: NavigateFunction,
  onError?: (message: string) => void
): void {
  if (!link) {
    onError?.("No se encontro un link para esta tarea.");
    return;
  }

  const repository = parseGithubRepositoryUrl(link);
  if (!repository) {
    onError?.("Link invalido, por favor ingrese un link valido.");
    return;
  }
  navigate({
    pathname: "/graph",
    search: createSearchParams({
      repoOwner: repository.owner,
      repoName: repository.repoName,
      submissionId: submissionId.toString(),
    }).toString(),
  });
}
