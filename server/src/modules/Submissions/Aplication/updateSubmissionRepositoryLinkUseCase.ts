import SubmissionRepository from "../Repository/SubmissionsRepository";
import GitHubRepositoryValidator from "../Repository/GitHubRepositoryValidator";
import {
  SubmissionDataObject,
  SubmissionRepositoryLinkUpdateObject,
} from "../Domain/Submission";

class UpdateSubmissionRepositoryLinkUseCase {
  private readonly repository: SubmissionRepository;
  private readonly githubRepositoryValidator: GitHubRepositoryValidator;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
    this.githubRepositoryValidator = new GitHubRepositoryValidator();
  }

  async execute(
    submissionid: number,
    userid: number,
    updatedSubmission: SubmissionRepositoryLinkUpdateObject
  ): Promise<SubmissionDataObject | null> {
    try {
      const url = new URL(updatedSubmission.repository_link);
      const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
      const [owner, repoName] = pathParts;

      const repositoryExists = await this.githubRepositoryValidator.repositoryExists(owner, repoName);

      if (!repositoryExists) {
        throw new Error("GITHUB_REPOSITORY_NOT_FOUND");
      }

      return await this.repository.UpdateSubmissionRepositoryLink(
        submissionid,
        userid,
        updatedSubmission
      );
    } catch (error) {
      console.error("Error updating Submission repository link");
      throw error;
    }
  }
}

export default UpdateSubmissionRepositoryLinkUseCase;