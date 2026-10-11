export interface GithubRepositoryCoordinates {
  owner: string;
  repoName: string;
}

const GITHUB_SEGMENT_PATTERN = /^[A-Za-z0-9._-]+$/;

export function parseGithubRepositoryUrl(
  repositoryUrl: string | null | undefined,
): GithubRepositoryCoordinates | null {
  if (!repositoryUrl?.trim()) return null;

  try {
    const url = new URL(repositoryUrl.trim());
    if (
      url.protocol !== "https:" || url.hostname !== "github.com" ||
      url.username || url.password || url.port || url.search || url.hash
    ) return null;

    const segments = url.pathname.split("/");
    if (
      segments[0] !== "" ||
      (segments.length !== 3 && segments.length !== 4) ||
      (segments.length === 4 && segments[3] !== "")
    ) return null;

    const [, owner, repoName] = segments;
    if (
      owner.length > 100 || repoName.length > 100 ||
      owner === "." || owner === ".." || repoName === "." || repoName === ".." ||
      !GITHUB_SEGMENT_PATTERN.test(owner) ||
      !GITHUB_SEGMENT_PATTERN.test(repoName) || repoName.toLowerCase().endsWith(".git")
    ) return null;

    return { owner, repoName };
  } catch {
    return null;
  }
}
