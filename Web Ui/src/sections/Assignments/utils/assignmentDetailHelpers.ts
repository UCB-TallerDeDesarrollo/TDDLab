import { createSearchParams, NavigateFunction } from "react-router-dom";

export function isStudent(role: string): boolean {
  return role === "student";
}

export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 8);
  return timestamp + randomChars;
}

export function getDisplayStatus(status: string | undefined): string | undefined {
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

function parseGithubLink(link: string): { owner: string; repo: string } | null {
  const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
  const match = regex.exec(link);

  if (!match) {
    return null;
  }

  const [, owner, repo] = match;
  return { owner, repo };
}

export function redirectToAdminGraph(
  navigate: NavigateFunction,
  link: string,
  fetchedSubmissions: unknown[],
  submissionId: number,
  url: string
): boolean {
  const parsed = parseGithubLink(link);

  if (!parsed) {
    return false;
  }

  navigate({
    pathname: url,
    search: createSearchParams({
      repoOwner: parsed.owner,
      repoName: parsed.repo,
      fetchedSubmissions: JSON.stringify(fetchedSubmissions),
      submissionId: submissionId.toString(),
    }).toString(),
  });

  return true;
}
