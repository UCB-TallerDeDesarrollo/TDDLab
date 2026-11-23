import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";
import { DBJobsRepository } from "./DBJobsRepository";
import { FakeDBJobsRepository } from "./FakeDBJobsRepository";
import { FakeGithubRepository } from "./FakeGithubRepository";
import { GithubRepository } from "./GithubRepository";

export function createTDDCyclesDependencies(): { dbJobsRepository: IDBJobsRepository; githubRepository: IGithubRepository } {
  if (process.env.TDD_JOBS_REPOSITORY === "fake") {
    return { dbJobsRepository: new FakeDBJobsRepository(), githubRepository: new FakeGithubRepository() };
  }

  return { dbJobsRepository: new DBJobsRepository(), githubRepository: new GithubRepository() };
}
