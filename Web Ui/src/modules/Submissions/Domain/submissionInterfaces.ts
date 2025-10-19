export interface SubmissionDataObject {
  id: number;
  assignmentid: number;
  userid: number;
  status: string;
  repository_link: string;
  start_date: Date;
  end_date: Date;
  comment: string;
}

export interface SubmissionCreationObject {
  assignmentid: number;
  userid: number;
  status: string;
  repository_link: string;
  start_date: Date;
}

export interface SubmissionUpdateObject {
  id?: number;
  status: string;
  end_date: Date;
  comment: string;
}
