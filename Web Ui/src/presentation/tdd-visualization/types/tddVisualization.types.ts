import { Dispatch, SetStateAction } from "react";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { BranchDTO, MergeDTO } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommentDataObject } from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import type { TeacherSubmission } from "../../../shared/types/teacherSubmission";

export interface CycleReportViewProps {
  port: CommitHistoryRepository;
  role: string;
  teacher_id: number;
  graphs: string;
}

export type Submission = TeacherSubmission;

export interface TDDVisualizationData {
  commits: CommitDataObject[];
  commitsTddCycles: CommitCycle[];
  tddLogs: TDDLogEntry[];
  branches: BranchDTO[];
  merges: MergeDTO[];
}

export interface TDDCommentsData {
  comments: CommentDataObject[];
  emails: Record<number, string>;
}

export interface TDDChartsState {
  commitsInfo: CommitDataObject[] | null;
  commitsTddCycles: CommitCycle[];
  metric: string | null;
  setMetric: Dispatch<SetStateAction<string | null>>;
  tddLogsInfo: TDDLogEntry[] | null;
  branchesInfo: BranchDTO[] | null;
  mergesInfo: MergeDTO[] | null;
}

export interface TDDExecutionView {
  testId: number;
  timestamp: number;
  passed: boolean;
  passedTests: number;
  failedTests: number;
  totalTests: number;
  detail: string;
}

export interface TDDCommitView {
  sha: string;
  parentSha?: string;
  author?: string;
  htmlUrl?: string;
  message: string;
  timestamp: number;
  coverage: number;
  tddCycle: string | null;
  executions: TDDExecutionView[];
}

export interface TDDBranchView {
  name: string;
  color: string;
  commits: TDDCommitView[];
  executionCount: number;
}

export interface TDDChartPoint {
  sha: string;
  commitNumber: number;
  message: string;
  tests: TDDExecutionView[];
}

export interface TDDChartSummary {
  totalCommits: number;
  totalExecutions: number;
  totalPassed: number;
  totalFailed: number;
}

export interface TDDDashboardViewState {
  branches: TDDBranchView[];
  selectedBranch: TDDBranchView | null;
  selectedBranchName: string | null;
  selectBranch: (branchName: string) => void;
  chartData: TDDChartPoint[];
  summary: TDDChartSummary;
  hasExecutions: boolean;
}
