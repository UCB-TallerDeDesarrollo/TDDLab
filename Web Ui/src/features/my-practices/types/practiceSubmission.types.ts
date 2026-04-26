export interface PracticeSubmissionDataObject {
  id: number;
  practiceid: number;
  userid: number;
  status: string;
  repository_link: string;
  start_date: Date | null;
  end_date: Date | null;
  comment: string | null;
}

export interface PracticeSubmissionCreationObject {
  practiceid: number;
  userid: number | undefined;
  status: string;
  repository_link: string;
  start_date: Date | null;
}

export interface PracticeSubmissionUpdateObject {
  id?: number;
  status: string;
  end_date: Date | null;
  comment: string | null;
}
