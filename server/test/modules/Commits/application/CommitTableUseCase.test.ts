import { CommitTableUseCases } from "../../../../src/modules/Commits/Application/CommitTableUseCases";
import { getCommitRepositoryMock } from "../../../__mocks__/Commits/repositoryMock";
import { mockCommitDataObject } from "../../../__mocks__/Commits/dataTypeMocks/commitData";
import { GithubAdapter } from "../../../../src/modules/Github/Repositories/github.API";

const commitRepositoryMock = getCommitRepositoryMock();
let createCommitTableInstance: CommitTableUseCases;
let adapter: GithubAdapter;

beforeEach(() => {
  createCommitTableInstance = new CommitTableUseCases(commitRepositoryMock,adapter);
});

describe("Commit operations", () => {
  it("should fail to get a commit", async () => {
    commitRepositoryMock.getCommits.mockResolvedValue(mockCommitDataObject);

    const response = await createCommitTableInstance.getCommitsAPI(
      "owner",
      "repoName"
    );

    expect(response).toEqual(mockCommitDataObject);

    expect(commitRepositoryMock.getCommits).toHaveBeenCalledWith(
      "owner",
      "repoName"
    );
  });
});

