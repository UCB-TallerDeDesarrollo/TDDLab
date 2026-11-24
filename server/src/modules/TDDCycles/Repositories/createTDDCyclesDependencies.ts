import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";
import { ITestResultRegistrationRepository } from "../Domain/ITestResultRegistrationRepository";
import { DBJobsRepository } from "./DBJobsRepository";
import { FakeDBJobsRepository } from "./FakeDBJobsRepository";
import { FakeGithubRepository } from "./FakeGithubRepository";
import { GithubRepository } from "./GithubRepository";

export function createTDDCyclesDependencies(): { dbJobsRepository: IDBJobsRepository; githubRepository: IGithubRepository; registrationRepository: ITestResultRegistrationRepository | null } {
  if (process.env.TDD_JOBS_REPOSITORY === "fake") {
    const dbJobsRepository = new FakeDBJobsRepository();
    return { dbJobsRepository, githubRepository: new FakeGithubRepository(), registrationRepository: dbJobsRepository };
  }

  return { dbJobsRepository: new DBJobsRepository(), githubRepository: new GithubRepository(), registrationRepository: null };
}
