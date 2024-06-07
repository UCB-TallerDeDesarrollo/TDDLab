import { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/Submission";

  
export const SubmissionInProgresDataMock: SubmissionDataObject = {
id: 2,
assignmentid: 25,
userid: 4,
status: "in progress",
repository_link: "enlace",
start_date: new Date("2023-01-01"),
end_date: new Date("2023-01-10"),
comment: "Comentario",
};
  
export function getSubmissionListMock(): SubmissionDataObject[] {
    return [
        {

        id: 1,
        assignmentid: 25,
        userid: 4,
        status: "pending",
        repository_link: "enlace",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-01-10"),
        comment: "Comentario",
        },
        {
        id: 2,
        assignmentid: 25,
        userid: 4,
        status: "delivered",
        repository_link: "enlace",
        start_date: new Date("2024-02-15"),
        end_date: new Date("2024-02-25"),
        comment: "Comentario",
        },
    ];
}
  