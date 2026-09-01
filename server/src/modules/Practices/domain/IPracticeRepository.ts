import { PracticeDataObject, PracticeCreationObject } from "./Practice";

export interface IPracticeRepository {
  obtainPractices(): Promise<PracticeDataObject[]>;
  obtainPracticeById(id: string): Promise<PracticeDataObject | null>;
  obtainPracticesByUserId(userid: string): Promise<PracticeDataObject[]>;
  createPractice(practice: PracticeCreationObject): Promise<PracticeCreationObject>;
  deletePractice(id: string): Promise<void>;
  updatePractice(id: string, updatedPractice: PracticeCreationObject): Promise<PracticeCreationObject | null>;
}
