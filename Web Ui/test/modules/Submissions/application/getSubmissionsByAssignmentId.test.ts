import { GetSubmissionsByAssignmentId } from "../../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";
import { MockSubmissionRepository } from "../../__mocks__/submissions/mockSubmissionsRepository";
import { submissionInProgressDataMock } from "../../__mocks__/submissions/data/submissionDataMock";

let mockRepository: MockSubmissionRepository;
let getSubmissionsByAssignmentId: GetSubmissionsByAssignmentId;

beforeEach(() => {
    mockRepository = new MockSubmissionRepository();
    getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(mockRepository);
});

describe("GetSubmissionsByAssignmentId", () => {
    it("should return a list of submissions for a given assignment ID", async () => {
        const assignmentId = 2;
        const mockSubmissions: SubmissionDataObject[] = [submissionInProgressDataMock];
        mockRepository.getSubmissionsByAssignmentId.mockResolvedValue(mockSubmissions);

        const result = await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentId);

        expect(result).toEqual(mockSubmissions);
        expect(mockRepository.getSubmissionsByAssignmentId).toHaveBeenCalledWith(assignmentId);
    });

    it("should throw an error if the repository call fails", async () => {
        const assignmentId = 2;
        const error = new Error("Failed to get submissions");
        mockRepository.getSubmissionsByAssignmentId.mockRejectedValue(error);

        await expect(getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentId)).rejects.toThrow(error);
        expect(mockRepository.getSubmissionsByAssignmentId).toHaveBeenCalledWith(assignmentId);
    });
});