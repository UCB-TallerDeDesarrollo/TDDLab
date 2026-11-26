import type { Dispatch, SetStateAction } from "react";

import type {
  CommitHistoryRepository
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

import type {
  CommitHistoryRepositoryBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterfaceBranchSupport";

import type {
  CommitDataObject
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type {
  CommitDataObjectBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfacesBranchSupport";

import type {
  CommitCycle
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

import type {
  CommitCycleBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterfaceBranchSupport";

import type {
  TopologyGraphResponseBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/ITopologyGraphBranchSupport";

import type {
  TestExecutionDataBranchSupport
} from "../../../modules/TDDCycles-Visualization/domain/ITestExecutionDataBranchSupport";

import type {
  TDDLogEntry
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import type {
  CommentDataObject
} from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

import type {
  TeacherSubmission
} from "../../../shared/types/teacherSubmission";

// =====================================================
// PROPIEDADES DE LA PÁGINA ACTUAL
// =====================================================

export interface CycleReportViewProps {
  port: CommitHistoryRepository;
  role: string;
  teacher_id: number;
  graphs: string;
}

export type Submission = TeacherSubmission;

// =====================================================
// DATOS UTILIZADOS POR LAS GRÁFICAS ORIGINALES
// =====================================================

export interface TDDVisualizationData {
  commits: CommitDataObject[];
  commitsTddCycles: CommitCycle[];
  tddLogs: TDDLogEntry[];
}

// =====================================================
// DATOS DE COMENTARIOS
// =====================================================

export interface TDDCommentsData {
  comments: CommentDataObject[];
  emails: Record<number, string>;
}

// =====================================================
// ESTADO DE LAS GRÁFICAS EXISTENTES
// =====================================================

export interface TDDChartsState {
  commitsInfo: CommitDataObject[] | null;
  commitsTddCycles: CommitCycle[];
  metric: string | null;
  setMetric: Dispatch<SetStateAction<string | null>>;
  tddLogsInfo: TDDLogEntry[] | null;
}

// =====================================================
// NUEVOS TIPOS PARA BRANCH SUPPORT
// =====================================================

// Una cadena vacía indica que no se ha seleccionado
// una rama específica.


// Commit utilizado por BranchSupport.
// Conserva la información de la API nueva.
export type BranchCommit =
  CommitDataObjectBranchSupport;

// Ciclo TDD asociado a una rama.
export type BranchCommitCycle =
  CommitCycleBranchSupport;

// Ejecución de pruebas asociada al commit.
export type BranchTestExecution =
  TestExecutionDataBranchSupport;

// Topología del repositorio Git.
export type BranchTopology =
  TopologyGraphResponseBranchSupport;

// =====================================================
// INFORMACIÓN DEL REPOSITORIO CON RAMAS
// =====================================================

export interface BranchVisualizationData {
  branches: string[];
  selectedBranch: string;
  commits: BranchCommit[];
  commitsTddCycles: BranchCommitCycle[];
  topology: BranchTopology | null;
}

// =====================================================
// CONFIGURACIÓN DEL REPOSITORIO BRANCH SUPPORT
// =====================================================

export interface BranchRepositoryDependencies {
  originalRepository: CommitHistoryRepository;
  branchRepository: CommitHistoryRepositoryBranchSupport;
}

// =====================================================
// ESTADO PARA LA SEGUNDA ENTREGA
// =====================================================

export interface BranchVisualizationState {
  availableBranches: string[];
  selectedBranch: string;
  isLoadingBranches: boolean;
  branchError: string | null;
}

// =====================================================
// ESTADO PARA LA TERCERA ENTREGA
// =====================================================

export interface GitTopologyState {
  topology: BranchTopology | null;
  isLoadingTopology: boolean;
  topologyError: string | null;
}
