export interface AssignmentScreenProps {
  userRole: string;
  userGroupid: number;
}

export interface AssignmentListProps {
  assignments?: AssignmentListItemViewModel[];
  confirmationOpen?: boolean;
  feedbackMessage?: string;
  feedbackSeverity?: "success" | "error";
  handleClickDelete?: (assignmentId: number) => void;
  handleClickDetail?: (assignmentId: number) => void;
  handleConfirmDelete?: () => Promise<void>;
  setConfirmationOpen?: (open: boolean) => void;
  setFeedbackMessage?: (message: string) => void;
  setValidationDialogOpen?: (open: boolean) => void;
  userRole: string;
  validationDialogOpen?: boolean;
}

export interface AssignmentListItemViewModel {
  id: number;
  title: string;
  description: string;
  groupName: string;
  state: string;
}

export type AssignmentSorting =
  | ""
  | "A_Up_Order"
  | "A_Down_Order"
  | "Time_Up"
  | "Time_Down";
