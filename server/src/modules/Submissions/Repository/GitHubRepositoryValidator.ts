import { Octokit } from "octokit";

class GitHubRepositoryValidator {
  private readonly octokit: Octokit;

  constructor() {
    const { REACT_APP_AUTH_TOKEN } = process.env;
    this.octokit = new Octokit({ auth: REACT_APP_AUTH_TOKEN });
  }

  async repositoryExists(owner: string, repoName: string): Promise<boolean> {
    try {
      const response = await this.octokit.request(`GET /repos/${owner}/${repoName}`);

      return response.status === 200;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }

      throw error;
    }
  }
}

export default GitHubRepositoryValidator;