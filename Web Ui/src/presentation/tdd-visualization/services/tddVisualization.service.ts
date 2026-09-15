import { GetCommitTddCycle } from "../../../modules/TDDCycles-Visualization/application/GetCommitTddCycle";
import { GetCommitsOfRepo } from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepo";
import { GetDefaultBranch } from "../../../modules/TDDCycles-Visualization/application/GetDefaultBranch";
import { GetTDDLogs } from "../../../modules/TDDCycles-Visualization/application/GetTDDLogs";
import { GetUserName } from "../../../modules/TDDCycles-Visualization/application/GetUserName";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TeacherCommentsRepository from "../../../modules/teacherCommentsOnSubmissions/repository/CommentsRepository";
import { CommentsCreationObject } from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { TDDCommentsData, TDDVisualizationData } from "../types/tddVisualization.types";

function getFulfilledValue<T>(result: PromiseSettledResult<T>): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  return null;
}

export async function fetchTDDVisualizationData(
  port: CommitHistoryRepository,
  repoOwner: string,
  repoName: string,
): Promise<TDDVisualizationData> {
  const getCommitsOfRepoUseCase = new GetCommitsOfRepo(port);
  const getCommitTddCycleUseCase = new GetCommitTddCycle(port);
  const getDefaultBranchUseCase = new GetDefaultBranch(port);
  const getTDDLogsUseCase = new GetTDDLogs(port);

  const fetchTestData = async () => {
    const defaultBranch = await getDefaultBranchUseCase.execute(repoOwner, repoName);
    const tddLogs = await getTDDLogsUseCase.execute(repoOwner, repoName, defaultBranch);
    return { defaultBranch, tddLogs };
  };

  const [testDataResult, commitsResult, commitsTddCyclesResult] = await Promise.allSettled([
    fetchTestData(),
    getCommitsOfRepoUseCase.execute(repoOwner, repoName),
    getCommitTddCycleUseCase.execute(repoOwner, repoName),
  ]);

  const commits = getFulfilledValue(commitsResult) ?? [];
  const commitsTddCycles = getFulfilledValue(commitsTddCyclesResult) ?? [];
  const testData = getFulfilledValue(testDataResult);

  return {
    commits,
    commitsLoadError: commitsResult.status === "rejected",
    commitsTddCycles,
    defaultBranch: testData?.defaultBranch ?? null,
    tddLogs: testData?.tddLogs ?? [],
    testDataLoadError:
      testDataResult.status === "rejected" || commitsTddCyclesResult.status === "rejected",
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
