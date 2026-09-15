import { GetCommitTddCycle } from "../../../modules/TDDCycles-Visualization/application/GetCommitTddCycle";
import { GetCommitsOfRepo } from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepo";
import { GetTDDLogs } from "../../../modules/TDDCycles-Visualization/application/GetTDDLogs";
import { GetUserName } from "../../../modules/TDDCycles-Visualization/application/GetUserName";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TeacherCommentsRepository from "../../../modules/teacherCommentsOnSubmissions/repository/CommentsRepository";
import { CommentsCreationObject } from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { TDDCommentsData, TDDVisualizationData } from "../types/tddVisualization.types";

export async function fetchTDDVisualizationData(
  port: CommitHistoryRepository,
  repoOwner: string,
  repoName: string,
): Promise<TDDVisualizationData> {
  const getCommitsOfRepoUseCase = new GetCommitsOfRepo(port);
  const getCommitTddCycleUseCase = new GetCommitTddCycle(port);
  const getTDDLogsUseCase = new GetTDDLogs(port);

  const [tddLogsResult, commitsResult, commitsTddCyclesResult] = await Promise.allSettled([
    getTDDLogsUseCase.execute(repoOwner, repoName),
    getCommitsOfRepoUseCase.execute(repoOwner, repoName),
    getCommitTddCycleUseCase.execute(repoOwner, repoName),
  ]);

  const commitsLoadError = commitsResult.status === "rejected";
  const testDataLoadError =
    tddLogsResult.status === "rejected" || commitsTddCyclesResult.status === "rejected";

  return {
    commits: commitsResult.status === "fulfilled" ? commitsResult.value : [],
    commitsLoadError,
    commitsTddCycles:
      commitsTddCyclesResult.status === "fulfilled" ? commitsTddCyclesResult.value : [],
    tddLogs: tddLogsResult.status === "fulfilled" ? tddLogsResult.value : [],
    testDataLoadError,
  };
}

export function fetchOwnerName(
  port: CommitHistoryRepository,
  repoOwner: string,
) {
  const getUserNameUseCase = new GetUserName(port);
  return getUserNameUseCase.execute(repoOwner);
}

export async function fetchCommentsData(submissionId: number): Promise<TDDCommentsData> {
  const commentsRepo = new TeacherCommentsRepository();
  const usersRepository = new UsersRepository();
  const comments = await commentsRepo.getCommentsBySubmissionId(submissionId);
  const emails: Record<number, string> = {};

  for (const comment of comments) {
    try {
      const user = await usersRepository.getUserById(comment.teacher_id);
      emails[comment.teacher_id] = user.email.toString();
    } catch {
      emails[comment.teacher_id] = "Correo no disponible";
    }
  }

  return { comments, emails };
}

export function createTeacherComment(commentData: CommentsCreationObject) {
  const commentsRepo = new TeacherCommentsRepository();
  return commentsRepo.createComment(commentData);
}
