import { ITDDResultsRepository, TDDResultsSnapshot } from "../Domain/ITDDResultsRepository";
import { isValidBranch } from "../Domain/RepositoryRef";
import { TestResultValidationError } from "./TestResultValidationError";

export class IngestTDDResultsUseCase {
  constructor(private readonly repository: ITDDResultsRepository) {}

  async execute(input: unknown) {
    const invalid = (field: string): never => { throw new TestResultValidationError(field, `Invalid field: ${field}`); };
    if (!input || typeof input !== "object" || Array.isArray(input)) invalid("body");
    const body = input as Record<string, any>;
    for (const field of ["repoOwner", "repoName"]) {
      if (typeof body[field] !== "string" || !/^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$/.test(body[field])) invalid(field);
    }
    if (!isValidBranch(body.branch)) invalid("branch");
    if (!Array.isArray(body.commitHistory)) invalid("commitHistory");
    if (!Array.isArray(body.tddLog)) invalid("tddLog");
    const snapshot: TDDResultsSnapshot = JSON.parse(JSON.stringify({ commitHistory: body.commitHistory, tddLog: body.tddLog }));
    const nonnegative = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;
    const seen = new Set<string>();
    for (const [index, entry] of snapshot.commitHistory.entries()) {
      const prefix = `commitHistory[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry as unknown)) invalid(prefix);
      if (entry.sha === "HEAD" && typeof body.sha === "string" && body.sha !== "HEAD") entry.sha = body.sha;
      if (typeof entry.sha !== "string" || !entry.sha.trim() || entry.sha === "HEAD" || seen.has(entry.sha)) invalid(`${prefix}.sha`);
      seen.add(entry.sha);
      if (!entry.commit || typeof entry.commit.message !== "string" || typeof entry.commit.url !== "string" ||
          typeof entry.commit.date !== "string" || !Number.isFinite(Date.parse(entry.commit.date))) invalid(`${prefix}.commit`);
      if (!entry.stats || ![entry.stats.total, entry.stats.additions, entry.stats.deletions].every(nonnegative)) invalid(`${prefix}.stats`);
      if (!Number.isInteger(entry.test_count) || entry.test_count < 0) invalid(`${prefix}.test_count`);
      if (!nonnegative(entry.coverage) || entry.coverage > 100) invalid(`${prefix}.coverage`);
      if (!["success", "failure", "skipped"].includes(entry.conclusion)) invalid(`${prefix}.conclusion`);
    }
    for (const [index, entry] of snapshot.tddLog.entries()) {
      const prefix = `tddLog[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry as unknown)) invalid(prefix);
      if (entry.commitId !== undefined) {
        if (entry.commitId === "HEAD" && typeof body.sha === "string" && body.sha !== "HEAD") entry.commitId = body.sha;
        if (typeof entry.commitId !== "string" || !seen.has(entry.commitId)) invalid(`${prefix}.commitId`);
        if (!nonnegative(entry.commitTimestamp)) invalid(`${prefix}.commitTimestamp`);
      } else if (![entry.timestamp, entry.numPassedTests, entry.failedTests, entry.numTotalTests].every(nonnegative) ||
                 ![entry.numPassedTests, entry.failedTests, entry.numTotalTests].every(Number.isInteger) ||
                 entry.numPassedTests + entry.failedTests !== entry.numTotalTests || typeof entry.success !== "boolean") {
        invalid(prefix);
      }
    }
    await this.repository.saveSnapshot(body.repoOwner, body.repoName, body.branch, snapshot);
    return { commits: snapshot.commitHistory.length, logEntries: snapshot.tddLog.length };
  }
}
