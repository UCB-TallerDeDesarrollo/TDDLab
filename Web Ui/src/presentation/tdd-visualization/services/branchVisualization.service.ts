
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

import {
  GetCommitsOfRepoBranchSupport
} from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepoBranchSupport";

import {
  GetCommitTddCycleBranchSupport
} from "../../../modules/TDDCycles-Visualization/application/GetCommitTddCycleBranchSupport";

import {
  GetProjectBranchesBranchSupport
} from "../../../modules/TDDCycles-Visualization/application/GetProjectBranchesBranchSupport";

import {
  GetTopologyGraphBranchSupport
} from "../../../modules/TDDCycles-Visualization/application/GetTopologyGraphBranchSupport";

import type {
  BranchVisualizationData,
  BranchTopology
} from "../types/tddVisualization.types";

// =====================================================
// NORMALIZACIÓN DE DATOS PARA LAS GRÁFICAS ACTUALES
// =====================================================

// El modelo BranchSupport permite coverage = null.
// Los componentes gráficos originales esperan
// coverage como número.
//
// Convertimos null a 0 para evitar incompatibilidades
// de tipos. Esto no significa que la cobertura real
// sea 0%; es un valor de compatibilidad.
//
// Conservamos el resto de campos mediante spread,
// incluyendo branches, primary_branch y parents.

export function normalizeCommitForLegacyCharts(
  commit: CommitDataObjectBranchSupport
): CommitDataObject {

  return {
    ...commit,

    stats: {
      ...commit.stats,
      total: commit.stats.total ?? 0,
      additions: commit.stats.additions ?? 0,
      deletions: commit.stats.deletions ?? 0,
    },

    commit: {
      ...commit.commit,
      date: new Date(commit.commit.date),
    },

    coverage: commit.coverage ?? 0,
    test_count: commit.test_count ?? 0,
    conclusion: commit.conclusion ?? "",
  };
}

// =====================================================
// NORMALIZACIÓN DE CICLOS TDD
// =====================================================

export function normalizeCycleForLegacyCharts(
  cycle: {
    url: string;
    sha: string;
    tddCycle: string;
  }
): CommitCycle {

  return {
    ...cycle,
    url: cycle.url,
    sha: cycle.sha,
    tddCycle: cycle.tddCycle ?? "unknown",
  };
}

// =====================================================
// REPOSITORIO COMPATIBLE CON EL FRONTEND ORIGINAL
// =====================================================

// Este repositorio implementa el puerto original,
// pero obtiene los commits y ciclos desde BranchSupport.
//
// Se conservan las consultas originales para:
// - Nombre del propietario de GitHub.
// - Registros TDD almacenados en tdd_log.json.
//
// De esta forma, TDDChart, TDDLineChart,
// TDDBoard y los demás componentes existentes
// no necesitan cambiar en la primera entrega.

export function createBranchAwareRepository(
  originalRepository: CommitHistoryRepository,
  branchRepository: CommitHistoryRepositoryBranchSupport
): CommitHistoryRepository {

  const getCommitsUseCase =
    new GetCommitsOfRepoBranchSupport(
      branchRepository
    );

  const getCyclesUseCase =
    new GetCommitTddCycleBranchSupport(
      branchRepository
    );

  return {

    // -----------------------------------------------
    // COMMITS DESDE BRANCH SUPPORT
    // -----------------------------------------------

    async obtainCommitsOfRepo(
      owner: string,
      repoName: string
    ): Promise<CommitDataObject[]> {

      const commits =
        await getCommitsUseCase.execute(
          owner,
          repoName
        );

      return commits.map(
        normalizeCommitForLegacyCharts
      );
    },

    // -----------------------------------------------
    // CICLOS TDD DESDE BRANCH SUPPORT
    // -----------------------------------------------

    async obtainCommitTddCycle(
      owner: string,
      repoName: string
    ): Promise<CommitCycle[]> {

      const cycles =
        await getCyclesUseCase.execute(
          owner,
          repoName
        );

      return cycles.map(
        normalizeCycleForLegacyCharts
      );
    },

    // -----------------------------------------------
    // NOMBRE DE USUARIO DESDE EL SISTEMA ORIGINAL
    // -----------------------------------------------

    async obtainUserName(
      owner: string
    ): Promise<string> {

      return originalRepository.obtainUserName(
        owner
      );
    },

    // -----------------------------------------------
    // LOGS TDD DESDE EL SISTEMA ORIGINAL
    // -----------------------------------------------

    async obtainTDDLogs(
      owner: string,
      repoName: string
    ) {

      return originalRepository.obtainTDDLogs(
        owner,
        repoName
      );
    },
  };
}

// =====================================================
// OBTENER TODAS LAS RAMAS DEL PROYECTO
// =====================================================

export async function fetchProjectBranches(
  branchRepository: CommitHistoryRepositoryBranchSupport,
  owner: string,
  repoName: string
): Promise<string[]> {

  const useCase =
    new GetProjectBranchesBranchSupport(
      branchRepository
    );

  const branches = await useCase.execute(
    owner,
    repoName
  );

  // Evita duplicados y nombres vacíos.
  return [
    ...new Set(
      branches.filter(
        (branch) => branch.trim().length > 0
      )
    )
  ];
}

// =====================================================
// CONSULTAR COMMITS DE UNA RAMA
// =====================================================

export async function fetchBranchCommits(
  branchRepository: CommitHistoryRepositoryBranchSupport,
  owner: string,
  repoName: string,
  selectedBranch: string = ""
): Promise<CommitDataObjectBranchSupport[]> {

  const useCase =
    new GetCommitsOfRepoBranchSupport(
      branchRepository
    );

  return useCase.execute(
    owner,
    repoName,
    selectedBranch || undefined
  );
}

// =====================================================
// CONSULTAR CICLOS TDD DE UNA RAMA
// =====================================================

export async function fetchBranchCycles(
  branchRepository: CommitHistoryRepositoryBranchSupport,
  owner: string,
  repoName: string,
  selectedBranch: string = ""
) {

  const useCase =
    new GetCommitTddCycleBranchSupport(
      branchRepository
    );

  return useCase.execute(
    owner,
    repoName,
    selectedBranch || undefined
  );
}

// =====================================================
// OBTENER COMMITS, CICLOS Y RAMAS
// =====================================================

// Función preparada para la segunda entrega.
//
// Si selectedBranch está vacío, no se manda el
// parámetro branch y el backend decide qué
// rama utilizar.
//
// No interpretamos una rama vacía como "todas",
// porque eso depende del contrato de la API.

export async function fetchBranchVisualizationData(
  branchRepository: CommitHistoryRepositoryBranchSupport,
  owner: string,
  repoName: string,
  selectedBranch: string = ""
): Promise<BranchVisualizationData> {

  const [
    branches,
    commits,
    commitsTddCycles
  ] = await Promise.all([

    fetchProjectBranches(
      branchRepository,
      owner,
      repoName
    ),

    fetchBranchCommits(
      branchRepository,
      owner,
      repoName,
      selectedBranch
    ),

    fetchBranchCycles(
      branchRepository,
      owner,
      repoName,
      selectedBranch
    ),
  ]);

  return {
    branches,
    selectedBranch,
    commits,
    commitsTddCycles,

    // Se cargará bajo demanda en la tercera entrega.
    topology: null,
  };
}

// =====================================================
// OBTENER TOPOLOGÍA GIT
// =====================================================

// Esta función será utilizada por GitTopologyChart
// en la tercera entrega.
//
// Retorna:
// - Ramas del proyecto.
// - Nodos de commits.
// - Relaciones entre commits.
// - Padres de cada commit.
// - Información de ejecuciones de pruebas.

export async function fetchGitTopology(
  branchRepository: CommitHistoryRepositoryBranchSupport,
  owner: string,
  repoName: string
): Promise<BranchTopology> {

  const useCase =
    new GetTopologyGraphBranchSupport(
      branchRepository
    );

  return useCase.execute(
    owner,
    repoName
  );
}
