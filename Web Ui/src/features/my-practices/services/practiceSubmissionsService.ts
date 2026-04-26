import { CreatePracticeSubmission } from "../../../modules/PracticeSubmissions/Application/CreatePracticeSubmission";
import { FinishPracticeSubmission } from "../../../modules/PracticeSubmissions/Application/FinishPracticeSubmission";
import { GetPracticeSubmissionsByPracticeId } from "../../../modules/PracticeSubmissions/Application/getPracticeSubmissionByPracticeId";
import { GetPracticeSubmissionByUserandPracticeSubmissionId } from "../../../modules/PracticeSubmissions/Application/getPracticeSubmissionByUserIdAnPracticeSubmissionId";
import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../types";
import PracticeSubmissionRepository from "../../../modules/PracticeSubmissions/Repository/PracticeSubmissionRepository";

const makeRepo = () => new PracticeSubmissionRepository();

export async function fetchSubmissionsByPracticeId(
  practiceId: number
): Promise<PracticeSubmissionDataObject[]> {
  const repo = makeRepo();
  return new GetPracticeSubmissionsByPracticeId(repo).getPracticeSubmissionsByPracticeId(practiceId);
}

export async function fetchSubmissionByUserAndPractice(
  practiceId: number,
  userId: number
): Promise<PracticeSubmissionDataObject> {
  const repo = makeRepo();
  return new GetPracticeSubmissionByUserandPracticeSubmissionId(
    repo
  ).getPracticeSubmisssionByUserandPracticeSubmissionId(practiceId, userId);
}

export async function startPracticeSubmission(
  data: PracticeSubmissionCreationObject
): Promise<void> {
  const repo = makeRepo();
  await new CreatePracticeSubmission(repo).createPracticeSubmission(data);
}

export async function finishPracticeSubmission(
  submissionId: number,
  data: PracticeSubmissionUpdateObject
): Promise<void> {
  const repo = makeRepo();
  await new FinishPracticeSubmission(repo).finishSubmission(submissionId, data);
}
