export interface AssignmentDataObject {
  title: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  state: "pending" | "in progress" | "delivered";
  link: string | null; // Add the link field
}
