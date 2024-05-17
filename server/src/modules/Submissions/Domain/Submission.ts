export interface SubmissionCreationObect{
    assignmentid: number;
    userid: number;
    status: "pending" | "in progress" | "delivered";
    repository_link: string;
    start_date: Date | null;
}

export interface SubmissionDataObect{
    id: number
    assignmentid: number;
    userid: number;
    status: "pending" | "in progress" | "delivered";
    repository_link: string;
    start_date: Date | null;
    end_date: Date | null;
    comment: string | null;
}

export interface SubmissionUpdateObject{
    status: "pending" | "in progress" | "delivered";
    end_date: Date | null;
    comment: string | null;
}