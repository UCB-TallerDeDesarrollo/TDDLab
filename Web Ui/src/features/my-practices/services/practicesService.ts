import { CreatePractice } from "../../../modules/Practices/application/CreatePractice";
import { DeletePractice } from "../../../modules/Practices/application/DeletePractice";
import { GetPracticeById } from "../../../modules/Practices/application/GetPracticeById";
import { UpdatePractice } from "../../../modules/Practices/application/UpdatePractice";
import PracticesRepository from "../../../modules/Practices/repository/PracticesRepository";
import { PracticeDataObject } from "../types";

const makeRepo = () => new PracticesRepository();

export async function fetchPracticesByUserId(
  userid: number
): Promise<PracticeDataObject[]> {
  return makeRepo().getPracticeByUserId(userid);
}

export async function fetchPracticeById(
  practiceId: number
): Promise<PracticeDataObject | null> {
  const repo = makeRepo();
  return new GetPracticeById(repo).obtainAssignmentDetail(practiceId);
}

export async function createPractice(
  data: Omit<PracticeDataObject, "id">
): Promise<void> {
  const repo = makeRepo();
  await new CreatePractice(repo).createPractice(data as PracticeDataObject);
}

export async function updatePractice(
  practiceId: number,
  data: PracticeDataObject
): Promise<void> {
  const repo = makeRepo();
  await new UpdatePractice(repo).updatePractice(practiceId, data);
}

export async function deletePractice(practiceId: number): Promise<void> {
  const repo = makeRepo();
  await new DeletePractice(repo).DeletePractice(practiceId);
}
