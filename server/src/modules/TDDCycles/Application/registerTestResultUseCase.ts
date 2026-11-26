import { ITestResultRegistrationRepository, RegistrationOutcome } from "../Domain/ITestResultRegistrationRepository";
import { TestResultValidationError } from "./TestResultValidationError";
import { isValidBranch } from "../Domain/RepositoryRef";

export class RegisterTestResultUseCase {
  constructor(private readonly repository: ITestResultRegistrationRepository) {}

  async execute(input: unknown): Promise<RegistrationOutcome> {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      throw new TestResultValidationError("body", "Invalid request body");
    }

    const data = input as Record<string, unknown>;
    const fields = ["sha", "owner", "reponame", "conclusion"] as const;
    for (const field of fields) {
      const value = data[field];
      if (typeof value !== "string" || !value.trim()) {
        throw new TestResultValidationError(field, `Invalid field: ${field}`);
      }
    }

    const sha = data.sha as string;
    const owner = data.owner as string;
    const reponame = data.reponame as string;
    const conclusion = data.conclusion as string;
    if (!["success", "failure", "skipped"].includes(conclusion)) {
      throw new TestResultValidationError("conclusion", "Invalid field: conclusion");
    }

    if (data.branch !== undefined && !isValidBranch(data.branch)) {
      throw new TestResultValidationError("branch", "Invalid field: branch");
    }
    return this.repository.register({ sha, owner, reponame, conclusion, ...(data.branch === undefined ? {} : { branch: data.branch as string }) });
  }
}
