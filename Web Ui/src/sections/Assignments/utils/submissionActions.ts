import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../../modules/Submissions/Aplication/createSubmission";
import { FinishSubmission } from "../../../modules/Submissions/Aplication/finishSubmission";
import {
  SubmissionCreationObject,
  SubmissionUpdateObject,
} from "../../../modules/Submissions/Domain/submissionInterfaces";

export const createAssignmentSubmission = async (params: {
  assignmentId: number;
  userId: number;
  repositoryLink: string;
}) => {
  const { assignmentId, userId, repositoryLink } = params;
  const submissionsRepository = new SubmissionRepository();
  const createSubmission = new CreateSubmission(submissionsRepository);
  const startDate = new Date();
  const start_date = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const submissionData: SubmissionCreationObject = {
    assignmentid: assignmentId,
    userid: userId,
    status: "in progress",
    repository_link: repositoryLink,
    start_date: start_date,
  };

  await createSubmission.createSubmission(submissionData);
};

export const finishAssignmentSubmission = async (params: {
  submissionId: number;
  comment: string;
}) => {
  const { submissionId, comment } = params;
  const submissionRepository = new SubmissionRepository();
  const finishSubmission = new FinishSubmission(submissionRepository);
  const endDate = new Date();
  const end_date = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const submissionData: SubmissionUpdateObject = {
    id: submissionId,
    status: "delivered",
    end_date: end_date,
    comment: comment,
  };

  await finishSubmission.finishSubmission(submissionId, submissionData);
};
