export type ViewState = "loading" | "error" | "empty" | "success";

export interface SubmissionRowView {
  id: number;
  email: string;
  status: string;
  repositoryLink: string;
  startDate: string;
  endDate: string;
  comment: string;
}
