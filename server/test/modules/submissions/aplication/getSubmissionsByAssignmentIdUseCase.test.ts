import GetSubmissionsByAssignmentIdUseCase from "../../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentIdUseCase";
import SubmissionRepository from "../../../../src/modules/Submissions/Repository/SubmissionsRepository";
import { getSubmissionListMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

describe("GetSubmissionsByAssignmentIdUseCase", () => {
    let repositoryMock: ReturnType<typeof getSubmissionRepositoryMock>;
    let useCase: GetSubmissionsByAssignmentIdUseCase;

    beforeEach(() => {
        repositoryMock = getSubmissionRepositoryMock();
        useCase = new GetSubmissionsByAssignmentIdUseCase(repositoryMock as unknown as SubmissionRepository);
    });

    it("should return submissions for a specific assignmentId", async () => {
        const mockSubmissions = getSubmissionListMock();
        repositoryMock.getSubmissionsByAssignmentId.mockResolvedValue(mockSubmissions);

        const assignmentId = 25;
        const result = await useCase.execute(assignmentId);

        expect(result).toEqual(mockSubmissions);
        expect(repositoryMock.getSubmissionsByAssignmentId).toHaveBeenCalledWith(assignmentId);
    });

    it("should return null if no submissions are found", async () => {
        repositoryMock.getSubmissionsByAssignmentId.mockResolvedValue([]);

        const assignmentId = 25;
        const result = await useCase.execute(assignmentId);

        expect(result).toEqual([]);
        expect(repositoryMock.getSubmissionsByAssignmentId).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw an error if the repository method throws an error", async () => {
        const error = new Error("Repository error");
        repositoryMock.getSubmissionsByAssignmentId.mockRejectedValue(error);

        const assignmentId = 25;
        await expect(useCase.execute(assignmentId)).rejects.toThrow(error);
    });
});
