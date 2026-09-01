type PracticeSubmissionStatus = "pending" | "in progress" | "delivered";

export enum PracticeSubmissionsFields {
  Id = 'id',
  PracticeId = 'practiceid',
  UserId = 'userid',
  Status = 'status',
  RepositoryLink = 'repository_link',
  StartDate = 'start_date',
  EndDate = 'end_date',
  Comment = 'comment',
}

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
