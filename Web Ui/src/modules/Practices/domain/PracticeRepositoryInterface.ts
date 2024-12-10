import { PracticeDataObject } from "./PracticeInterface";

interface PracticeRepositoryInterface {
  getPractices(): Promise<PracticeDataObject[]>;
  getPracticeById(practiceId: number): Promise<PracticeDataObject | null>;
  createPractice(practiceData: PracticeDataObject): Promise<void>;
  updatePractice(
    practiceId: number,
    practiceData: PracticeDataObject
  ): Promise<void>;
  deletePractice(practiceId: number): Promise<void>;
}

export default PracticeRepositoryInterface;
