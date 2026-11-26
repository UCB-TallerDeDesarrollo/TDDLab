import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { BranchDTO } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  CommitCycle,
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import type {
  TDDLogEntry,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import type {
  TDDDashboardViewState,
} from "../types/tddVisualization.types";
import {
  buildTDDChartData,
  buildTDDChartSummary,
  buildTDDDashboardViewModel,
  createEmptyTDDChartSummary,
} from "../services/tddDashboardMapper";

const EMPTY_COMMITS: CommitDataObject[] = [];
const EMPTY_CYCLES: CommitCycle[] = [];
const EMPTY_LOGS: TDDLogEntry[] = [];

export function useTDDDashboard(
  commits: CommitDataObject[] | null,
  cycles: CommitCycle[] | null,
  logs: TDDLogEntry[] | null,
  branchesFromRepo?: BranchDTO[] | null,
  selectedBranchName?: string | null,
): TDDDashboardViewState {
  const branches = useMemo(
    () =>
      buildTDDDashboardViewModel(
        commits ?? EMPTY_COMMITS,
        cycles ?? EMPTY_CYCLES,
        logs ?? EMPTY_LOGS,
        branchesFromRepo ?? undefined,
      ),
    [commits, cycles, logs, branchesFromRepo],
  );

  const [internalSelectedBranchName, setInternalSelectedBranchName] =
    useState<string | null>(() => branches[0]?.name ?? null);

  useEffect(() => {
    setInternalSelectedBranchName((current) => {
      if (
        selectedBranchName != null &&
        branches.some((branch) => branch.name === selectedBranchName)
      ) {
        return selectedBranchName;
      }

      if (current && branches.some((branch) => branch.name === current)) {
        return current;
      }

      return branches[0]?.name ?? null;
    });
  }, [branches, selectedBranchName]);

  const selectBranch = useCallback((branchName: string) => {
    setInternalSelectedBranchName(branchName);
  }, []);

  const effectiveSelectedBranchName =
    selectedBranchName ?? internalSelectedBranchName;

  const selectedBranch = useMemo(
    () =>
      branches.find((branch) => branch.name === effectiveSelectedBranchName) ??
      branches[0] ??
      null,
    [branches, effectiveSelectedBranchName],
  );

  const chartData = useMemo(
    () => (selectedBranch ? buildTDDChartData(selectedBranch) : []),
    [selectedBranch],
  );

  const summary = useMemo(
    () =>
      selectedBranch
        ? buildTDDChartSummary(selectedBranch)
        : createEmptyTDDChartSummary(),
    [selectedBranch],
  );

  return {
    branches,
    selectedBranch,
    selectedBranchName: selectedBranch?.name ?? null,
    selectBranch,
    chartData,
    summary,
    hasExecutions: summary.totalExecutions > 0,
  };
}
