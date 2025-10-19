// test/modules/teacherCommentsOnSubmissions/application/GetCommentsBySubmissionId.test.ts
import { GetCommentsBySubmissionId } from "../../../../src/modules/teacherCommentsOnSubmissions/application/GetComments";
import { MockTeacherCommentsRepository } from "../../__mocks__/submissions/mockTeacherCommentsRepository";
import { commentDataMock } from "../../__mocks__/submissions/commentDataMock";

describe('GetCommentsBySubmissionId', () => {
    let mockRepository: MockTeacherCommentsRepository;
    let getComments: GetCommentsBySubmissionId;

    beforeEach(() => {
        mockRepository = new MockTeacherCommentsRepository();
        getComments = new GetCommentsBySubmissionId(mockRepository);
    });

    it('should successfully get comments by submission ID', async () => {
        const mockComments = [{
            ...commentDataMock,
            id: 1,
            created_at: new Date()
        }];
        mockRepository.getCommentsBySubmissionId.mockResolvedValue(mockComments);

        const result = await getComments.getCommentsBySubmissionId(1);
        expect(result).toEqual(mockComments);
        expect(mockRepository.getCommentsBySubmissionId).toHaveBeenCalledWith(1);
    });

    it('should handle fetch error', async () => {
        mockRepository.getCommentsBySubmissionId.mockRejectedValue(new Error("Fetch failed"));
        await expect(getComments.getCommentsBySubmissionId(1))
            .rejects.toThrowError("Fetch failed");
    });
});