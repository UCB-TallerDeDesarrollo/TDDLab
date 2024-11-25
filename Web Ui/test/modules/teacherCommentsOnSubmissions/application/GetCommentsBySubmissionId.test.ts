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
});