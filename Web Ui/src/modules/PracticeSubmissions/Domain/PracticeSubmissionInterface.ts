export interface PracticeSubmissionDataObject {
  id: number;
  assignmentid: number;
  userid: number;
  status: string;
  repository_link: string;
  start_date: Date;
  end_date: Date;
  comment: string;
}

export interface PracticeSubmissionCreationObject {
  assignmentid: number;
  userid: number;
  status: string;
  repository_link: string;
  start_date: Date;
}

export interface PracticeSubmissionUpdateObject {
  id?: number;
  status: string;
  end_date: Date;
  comment: string;
}
