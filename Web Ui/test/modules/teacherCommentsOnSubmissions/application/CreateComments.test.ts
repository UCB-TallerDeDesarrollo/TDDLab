// test/modules/teacherCommentsOnSubmissions/application/CreateComments.test.ts
import { CreateComments } from "../../../../src/modules/teacherCommentsOnSubmissions/application/CreateComments";
import { MockTeacherCommentsRepository } from "../../__mocks__/submissions/mockTeacherCommentsRepository";
import { commentDataMock } from "../../__mocks__/submissions/commentDataMock";

describe('CreateComments', () => {
    let mockRepository: MockTeacherCommentsRepository;
    let createComments: CreateComments;

    beforeEach(() => {
        mockRepository = new MockTeacherCommentsRepository();
        createComments = new CreateComments(mockRepository);
    });

    it('should successfully create a new comment', async () => {
        const mockResponse = {
            ...commentDataMock,
            id: 1,
            created_at: new Date()
        };
        mockRepository.createComment.mockResolvedValue(mockResponse);

        const result = await createComments.createComment(commentDataMock);
        expect(result).toEqual(mockResponse);
        expect(mockRepository.createComment).toHaveBeenCalledWith(commentDataMock);
    });

    it('should handle creation error', async () => {
        mockRepository.createComment.mockRejectedValue(new Error("Creation failed"));
        await expect(createComments.createComment(commentDataMock))
            .rejects.toThrowError("Creation failed");
    });
});