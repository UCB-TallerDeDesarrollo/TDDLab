import { mockCommitDataObject } from "./dataTypeMocks/commitData";

export function getCommitRepositoryMock(){
    return {
      saveCommitInfoOfRepo: jest.fn(),
      getCommits: jest.fn(async (owner, repoName) =>{
            if (owner === 'FranAliss' && repoName === "Taller_Test_1") {
                return mockCommitDataObject;
            } 
            if (owner != 'FranAliss' && repoName != "Taller_Test_1") {
              let empty: any;
                return empty;
            }
            throw new Error('Commit not found');
        }),
      commitExists: jest.fn(async (sha) =>{
            if (sha === 'existing_sha') {
                return mockCommitDataObject;
            } 
            if (sha !== 'existing_sha') {
              let empty: any;
                return empty;
            }
            throw new Error('Commit not found');
        }),
      repositoryExist: jest.fn(),
    };
}


