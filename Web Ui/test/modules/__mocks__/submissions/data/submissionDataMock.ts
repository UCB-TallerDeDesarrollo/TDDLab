import { SubmissionDataObject } from "../../../../../src/modules/Submissions/Domain/submissionInterfaces";

export const submissionInProgressDataMock: SubmissionDataObject = {
    id: 3,
    assignmentid: 2,
    userid: 1,
    status: "in progress",
    repository_link: "",
    start_date: new Date("2023-01-01"),
    end_date: new Date("2023-01-10"),
    comment: "Comentario",
};