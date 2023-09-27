import { GithubAPIRepository } from "../../../../src/TDD-Visualization/domain/GithubAPIRepository";
import { mockCommitData } from "../__ mocks __/dataTypeMocks/commitData";

export class MockGithubAPI implements GithubAPIRepository {
  obtainCommitsOfRepo = jest.fn(async () => {
    return [mockCommitData];
  });
  obtainRunsOfGithubActions = jest.fn(async () => {
    return {};
  });
  obtainJobsOfACommit = jest.fn(async () => {
    return {};
  });
}
