
export function getCommitRepositoryMock(){
    return {
      saveCommitInfoOfRepo: jest.fn(),
      getCommits: jest.fn(),
      commitExists: jest.fn(),
      repositoryExist: jest.fn(),
    };
}


