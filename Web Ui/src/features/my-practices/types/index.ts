export type { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
export type {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../../../modules/PracticeSubmissions/Domain/PracticeSubmissionInterface";

export type ViewState = "loading" | "error" | "empty" | "success";
