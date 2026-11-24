import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
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
): TDDDashboardViewState {
  const branches = useMemo(
    () =>
      buildTDDDashboardViewModel(
        commits ?? EMPTY_COMMITS,
        cycles ?? EMPTY_CYCLES,
        logs ?? EMPTY_LOGS,
      ),
    [commits, cycles, logs],
  );

  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(
    () => branches[0]?.name ?? null,
  );

  useEffect(() => {
    setSelectedBranchName((current) => {
      if (current && branches.some((branch) => branch.name === current)) {
        return current;
      }

      return branches[0]?.name ?? null;
    });
  }, [branches]);

  const selectBranch = useCallback((branchName: string) => {
    setSelectedBranchName(branchName);
  }, []);

  const selectedBranch = useMemo(
    () =>
      branches.find((branch) => branch.name === selectedBranchName) ??
      branches[0] ??
      null,
    [branches, selectedBranchName],
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
