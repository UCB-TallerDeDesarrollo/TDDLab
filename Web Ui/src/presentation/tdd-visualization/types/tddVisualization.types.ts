import { Dispatch, SetStateAction } from "react";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { CommentDataObject } from "../../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

export interface CycleReportViewProps {
  port: CommitHistoryRepository;
  role: string;
  teacher_id: number;
}

export interface Submission {
  id: number;
  repository_link: string;
}

export interface TDDVisualizationData {
  commits: CommitDataObject[];
  tddLogs: TDDLogEntry[];
}

export interface TDDCommentsData {
  comments: CommentDataObject[];
  emails: Record<number, string>;
}

export interface TDDChartsState {
  commitsInfo: CommitDataObject[] | null;
  metric: string | null;
  setMetric: Dispatch<SetStateAction<string | null>>;
  tddLogsInfo: TDDLogEntry[] | null;
}
