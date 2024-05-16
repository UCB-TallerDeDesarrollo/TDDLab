export interface SubmissionCreationObect{
    assignmentid: number;
    userid: number;
    state: "pending" | "in progress" | "delivered";
    link: string;
    start_date: Date | null;
    end_date: Date | null;
    comment: string | null;
}