export interface AssignmentDataObject {
  id: number;
  title: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  state: "pending" | "delivered";
}
