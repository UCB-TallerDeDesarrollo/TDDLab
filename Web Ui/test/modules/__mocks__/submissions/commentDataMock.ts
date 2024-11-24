import { CommentsCreationObject } from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

export const commentDataMock: CommentsCreationObject = {
    id: 1,
    submission_id: 129,
    teacher_id: 10,
    content: "Buen trabajo",
    created_at: new Date("2024-01-01T00:00:00Z"),
};
