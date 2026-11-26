
import { GetCommitTddCycle } from "../../../modules/TDDCycles-Visualization/application/GetCommitTddCycle";

import { GetCommitsOfRepo } from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepo";

import { GetTDDLogs } from "../../../modules/TDDCycles-Visualization/application/GetTDDLogs";

import { GetUserName } from "../../../modules/TDDCycles-Visualization/application/GetUserName";

import type {
  CommitHistoryRepository
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

import type {
  CommitHistoryRepositoryBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterfaceBranchSupport";

import TeacherCommentsRepository from "../../../modules/teacherCommentsOnSubmissions/repository/CommentsRepository";

import type {
  CommentsCreationObject
} from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

import UsersRepository from "../../../modules/Users/repository/UsersRepository";

import type {
  TDDCommentsData,
  TDDVisualizationData,
  BranchVisualizationData
} from "../types/tddVisualization.types";

import {
  fetchBranchVisualizationData
} from "./branchVisualization.service";

// =====================================================
// CONSULTA DE DATOS PARA LAS GRÁFICAS ACTUALES
// =====================================================

export async function fetchTDDVisualizationData(
  port: CommitHistoryRepository,
  repoOwner: string,
  repoName: string
): Promise<TDDVisualizationData> {

  const getCommitsOfRepoUseCase =
    new GetCommitsOfRepo(port);

  const getCommitTddCycleUseCase =
    new GetCommitTddCycle(port);

  const getTDDLogsUseCase =
    new GetTDDLogs(port);

  // Se conservan los casos de uso actuales.
  //
  // Cuando port es el repositorio combinado creado
  // en App.tsx, las consultas de commits y ciclos
  // se dirigen a BranchSupport.
  //
  // Los logs TDD siguen utilizando el adaptador
  // original, que conoce la ubicación de tdd_log.json.

  const [
    tddLogs,
    commits,
    commitsTddCycles
  ] = await Promise.all([
    getTDDLogsUseCase.execute(
      repoOwner,
      repoName
    ),

    getCommitsOfRepoUseCase.execute(
      repoOwner,
      repoName
    ),

    getCommitTddCycleUseCase.execute(
      repoOwner,
      repoName
    ),
  ]);

  return {
    commits,
    commitsTddCycles,
    tddLogs,
  };
}

// =====================================================
// CONSULTA ESPECÍFICA DE UNA RAMA
// =====================================================

// Esta función será utilizada por el hook
// de visualización en la segunda entrega.
//
// Permite obtener los commits y ciclos TDD
// de una rama, junto con el listado de ramas.
//
// No consulta automáticamente la topología;
// esta se cargará cuando sea necesaria.

export function fetchTDDVisualizationDataByBranch(
  branchPort: CommitHistoryRepositoryBranchSupport,
  repoOwner: string,
  repoName: string,
  selectedBranch: string = ""
): Promise<BranchVisualizationData> {

  return fetchBranchVisualizationData(
    branchPort,
    repoOwner,
    repoName,
    selectedBranch
  );
}

// =====================================================
// OBTENER NOMBRE DEL PROPIETARIO
// =====================================================

export function fetchOwnerName(
  port: CommitHistoryRepository,
  repoOwner: string
): Promise<string> {

  const getUserNameUseCase =
    new GetUserName(port);

  return getUserNameUseCase.execute(
    repoOwner
  );
}

// =====================================================
// OBTENER COMENTARIOS DE LA ENTREGA
// =====================================================

export async function fetchCommentsData(
  submissionId: number
): Promise<TDDCommentsData> {

  const commentsRepo =
    new TeacherCommentsRepository();

  const usersRepository =
    new UsersRepository();

  const comments =
    await commentsRepo.getCommentsBySubmissionId(
      submissionId
    );

  const emails: Record<number, string> = {};

  await Promise.all(
    comments.map(async (comment) => {
      try {
        const user =
          await usersRepository.getUserById(
            comment.teacher_id
          );

        emails[comment.teacher_id] =
          user.email.toString();

      } catch {
        emails[comment.teacher_id] =
          "Correo no disponible";
      }
    })
  );

  return {
    comments,
    emails,
  };
}

// =====================================================
// CREAR COMENTARIO DEL DOCENTE
// =====================================================

export function createTeacherComment(
  commentData: CommentsCreationObject
) {

  const commentsRepo =
    new TeacherCommentsRepository();

  return commentsRepo.createComment(
    commentData
  );
}
