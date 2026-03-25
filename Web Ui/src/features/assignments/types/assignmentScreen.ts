export interface AssignmentScreenProps {
  userRole: string;
  userGroupid: number;
}

export interface AssignmentListProps {
  ShowForm: () => void;
  userRole: string;
  userGroupid: number | number[];
  onGroupChange: (groupId: number) => void;
}

export type AssignmentSorting =
  | ""
  | "A_Up_Order"
  | "A_Down_Order"
  | "Time_Up"
  | "Time_Down";
