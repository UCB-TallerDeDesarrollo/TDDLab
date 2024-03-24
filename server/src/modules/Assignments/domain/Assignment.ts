export interface AssignmentDataObject {
  id: string;
  title: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  state: "pending" | "in progress" | "delivered";
  link: string | null;
  comment: string | null;
  groupid: number;
}

export interface AssignmentCreationObject {
  title: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  state: "pending" | "in progress" | "delivered";
  link: string | null;
  comment: string | null;
  groupid: number;
}
