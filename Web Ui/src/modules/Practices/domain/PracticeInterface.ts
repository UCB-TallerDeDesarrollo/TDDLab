export interface PracticeDataObject {
  id: number;
  title: string;
  description: string;
  creation_date: Date;
  state: string;
  userid: number | undefined;
}

export interface PracticeCreationObject {
  title: string;
  description: string;
  userid: number;
}
