type PracticeSubmissionStatus = "pending" | "in progress" | "delivered";
export interface PracticeSubmissionCreationObject {
  practiceid: number;
  userid: number;
  status: PracticeSubmissionStatus;
  repository_link: string;
  start_date: Date | null;
}

export interface PracticeSubmissionDataObject {
  id: number;
  practiceid: number;
  userid: number;
  status: PracticeSubmissionStatus;
  repository_link: string;
  start_date: Date | null;
  end_date: Date | null;
  comment: string | null;
}

export interface PracticeSubmissionUpdateObject {
  status: PracticeSubmissionStatus;
  end_date: Date | null;
  comment: string | null;
}
