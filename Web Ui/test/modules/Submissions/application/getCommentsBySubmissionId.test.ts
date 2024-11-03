import { GetCommentsBySubmissionId } from "../../../../src/modules/teacherCommentsOnSubmissions/application/GetComments";
import { CommentsCreationObject } from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import { commentDataMock } from "../../__mocks__/submissions/commentDataMock";
import { MockTeacherCommentsRepository } from "../../__mocks__/submissions/mockTeacherCommentsRepository";

let mockRepository: MockTeacherCommentsRepository;
let getCommentsBySubmissionId: GetCommentsBySubmissionId;

beforeEach(() => {
    mockRepository = new MockTeacherCommentsRepository();
    getCommentsBySubmissionId = new GetCommentsBySubmissionId(mockRepository);
});

describe("GetCommentsBySubmissionId", () => {
    it("should return a list of comments for a given submission ID", async () => {
        const submissionId = 129;
        const mockComments: CommentsCreationObject[] = [commentDataMock];
        mockRepository.getCommentsBySubmissionId.mockResolvedValue(mockComments);

        const result = await getCommentsBySubmissionId.getCommentsBySubmissionId(submissionId);

        expect(result).toEqual(mockComments);
        expect(mockRepository.getCommentsBySubmissionId).toHaveBeenCalledWith(submissionId);
    });

    it("should throw an error if the repository call fails", async () => {
        const submissionId = 129;
        const error = new Error("Failed to get comments");
        mockRepository.getCommentsBySubmissionId.mockRejectedValue(error);

        await expect(getCommentsBySubmissionId.getCommentsBySubmissionId(submissionId)).rejects.toThrow(error);
        expect(mockRepository.getCommentsBySubmissionId).toHaveBeenCalledWith(submissionId);
    });
});
