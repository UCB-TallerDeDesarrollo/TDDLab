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
});