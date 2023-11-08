import { CommitUseCases } from "../../../../src/modules/Commits/Application/getCommits";
import { GithubAdapter } from "../../../../src/modules/Github/Repositories/github.API";
import { getCommitRepositoryMock } from "../../../__mocks__/Commits/repositoryMock";

let CommitRepositoryMock: any;
let CommitUseCaseClass: any;
let adapter: GithubAdapter;

beforeEach(() => {
  CommitRepositoryMock = getCommitRepositoryMock();
  CommitUseCaseClass = new CommitUseCases(CommitRepositoryMock, adapter);
});

describe("Get Commit by Id", () => {
    it("should handle errors when obtaining a commit with nonexisting user and repo", async () => {
    let response = await CommitUseCaseClass.getCommits("badUser", "badRepo");
        expect(response).toEqual({"error": "Error updating commits table"});
    });
});