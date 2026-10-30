import { Dispatch, SetStateAction } from "react";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
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
}
