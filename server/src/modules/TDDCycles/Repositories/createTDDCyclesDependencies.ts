import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";
import { ITestResultRegistrationRepository } from "../Domain/ITestResultRegistrationRepository";
import { DBJobsRepository } from "./DBJobsRepository";
import { FakeDBJobsRepository } from "./FakeDBJobsRepository";
import { FakeGithubRepository } from "./FakeGithubRepository";
import { GithubRepository } from "./GithubRepository";
import { ITDDResultsRepository } from "../Domain/ITDDResultsRepository";
import { DatabaseTDDResultsRepository, FakeTDDResultsRepository, FileTDDResultsRepository } from "./TDDResultsRepository";

export function createTDDCyclesDependencies(): { dbJobsRepository: IDBJobsRepository; githubRepository: IGithubRepository; registrationRepository: ITestResultRegistrationRepository | null; resultsRepository: ITDDResultsRepository; jobsGithubRepository: IGithubRepository } {
  const mode = process.env.TDD_RESULTS_REPOSITORY ?? process.env.TDD_JOBS_REPOSITORY ?? "database";
  if (!["database", "fake", "file"].includes(mode)) throw new Error("Invalid TDD_RESULTS_REPOSITORY");
  const resultsRepository = mode === "fake" ? new FakeTDDResultsRepository()
    : mode === "file" ? new FileTDDResultsRepository(process.env.TDD_JSON_DIRECTORY ?? "./data/tdd-results")
    : new DatabaseTDDResultsRepository();
  // Registered jobs are queried directly; explicit ingestion replaces Actions polling.
  const jobsGithubRepository = new FakeGithubRepository();
  if (mode === "fake") {
    const dbJobsRepository = new FakeDBJobsRepository();
    return { dbJobsRepository, githubRepository: new FakeGithubRepository(), registrationRepository: dbJobsRepository, resultsRepository, jobsGithubRepository };
  }

  const dbJobsRepository = new DBJobsRepository();
  return { dbJobsRepository, githubRepository: new GithubRepository(), registrationRepository: dbJobsRepository, resultsRepository, jobsGithubRepository };
}
