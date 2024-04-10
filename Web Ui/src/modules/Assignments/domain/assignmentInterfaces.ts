export interface AssignmentDataObject {
  id: number;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  state: string;
  link: string;
  comment: string | null;
  groupid: number;
}

export interface AssignmentCreationObject {
  title: string;
  description: string;
  groupid: number;
}