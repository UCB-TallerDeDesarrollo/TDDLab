import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";

export type MyPracticesSortOption = "" | "A_Up_Order" | "A_Down_Order" | "Time_Up" | "Time_Down";

export type MyPracticesViewState = "loading" | "error" | "empty" | "success";

export interface CreatePracticeInput {
  title: string;
  description: string;
  userid: number;
}

export interface MyPracticesState {
  practices: PracticeDataObject[];
  selectedSorting: MyPracticesSortOption;
  isLoading: boolean;
  error: string | null;
}
