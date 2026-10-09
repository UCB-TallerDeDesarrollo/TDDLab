export class GithubError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GithubBranchNotFoundError extends GithubError {
  constructor(owner: string, repoName: string, branch: string) {
    const message = `La rama '${branch}' no existe en ${owner}/${repoName}`;
    const code = "GITHUB_BRANCH_NOT_FOUND";

    super(message, code);

    this.name = "GithubBranchNotFoundError";
  }
}

export class GithubFileNotFoundError extends GithubError {
  constructor(owner: string, repoName: string, branch: string, path: string) {
    const message = `El archivo '${path}' no existe en la rama '${branch}' de ${owner}/${repoName}`;
    const code = "GITHUB_FILE_NOT_FOUND";

    super(message, code);

    this.name = "GithubFileNotFoundError";
  }
}