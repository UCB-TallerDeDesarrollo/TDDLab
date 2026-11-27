import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";
import { ITestResultRegistrationRepository } from "../Domain/ITestResultRegistrationRepository";
import { DBJobsRepository } from "./DBJobsRepository";
import { GithubRepository } from "./GithubRepository";

export function createTDDCyclesDependencies(): { dbJobsRepository: IDBJobsRepository; githubRepository: IGithubRepository; registrationRepository: ITestResultRegistrationRepository | null } {
  const dbJobsRepository = new DBJobsRepository();
  return { dbJobsRepository, githubRepository: new GithubRepository(), registrationRepository: dbJobsRepository };
}
