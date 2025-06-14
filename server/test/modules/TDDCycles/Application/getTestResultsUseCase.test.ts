import { GetTestResultsUseCase } from "../../../../src/modules/TDDCycles/Application/getTestResultsUseCase";
import { IDBJobsRepository } from "../../../../src/modules/TDDCycles/Domain/IDBJobsRepository";
import { IGithubRepository } from "../../../../src/modules/TDDCycles/Domain/IGithubRepository";
import { githubActionsRunsList, jobsFormatted, jobsToSave, mockJobDataObject } from "../../../__mocks__/TDDCycles/dataTypeMocks/jobData";

jest.mock("../../../../src/modules/TDDCycles/Domain/IDBJobsRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            repositoryExists: jest.fn(),
            getJobs: jest.fn(),
            saveJobsList: jest.fn(),
            getJobsNotSaved: jest.fn(),
        };
    });
});
jest.mock("../../../../src/modules/TDDCycles/Domain/IGithubRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getJobs: jest.fn(),
            getJobsInfoForTestResults: jest.fn(),
            getRunsOfGithubActionsIds: jest.fn(),
            getJobsDataFromGithub: jest.fn(),
        };
    });
});

describe("GetTestResultsUseCase", () => {
    let dbJobRepository: jest.Mocked<IDBJobsRepository>;
    let githubRepository: jest.Mocked<IGithubRepository>;
    let useCase: GetTestResultsUseCase;

    beforeEach(() => {
        dbJobRepository = new (require("../../../../src/modules/TDDCycles/Domain/IDBJobsRepository"))();
        githubRepository = new (require("../../../../src/modules/TDDCycles/Domain/IGithubRepository"))();
        useCase = new GetTestResultsUseCase(dbJobRepository, githubRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should correctly initialize GetTestResultsUseCase with provided repositories", () => {
        expect(useCase).toBeInstanceOf(GetTestResultsUseCase);
        expect(useCase['dbJobRepository']).toBe(dbJobRepository);
        expect(useCase['githubRepository']).toBe(githubRepository);
    });
});