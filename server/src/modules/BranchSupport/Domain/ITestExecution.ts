export type ExecutionSource = "local" | "ci";
export type ExecutionConclusion = "success" | "failure" | "cancelled" | "error";
export type TestResultStatus = "passed" | "failed" | "skipped" | "error";

export interface TestExecution {
  id: string;
  project_id: string;
  branch_id?: string | null;
  commit_sha?: string | null;
  source: ExecutionSource;
  executed_at: Date;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  error_tests: number;
  coverage?: number | null;
  covered_lines?: number | null;
  total_lines?: number | null;
  covered_branches?: number | null;
  total_branches?: number | null;
  duration_ms?: number | null;
  conclusion: ExecutionConclusion;
}

export interface TestResult {
  id: string;
  execution_id: string;
  test_name: string;
  test_full_name?: string | null;
  file_path?: string | null;
  status: TestResultStatus;
  duration_ms?: number | null;
  error_message?: string | null;
}

export interface CreateTestResultDTO {
  test_name: string;
  test_full_name?: string | null;
  file_path?: string | null;
  status: TestResultStatus;
  duration_ms?: number | null;
  error_message?: string | null;
}

export interface CreateTestExecutionDTO {
  project_id: string;
  branch_id?: string | null;
  commit_sha?: string | null;
  source?: ExecutionSource;
  executed_at?: string | Date;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests?: number;
  error_tests?: number;
  coverage?: number | null;
  covered_lines?: number | null;
  total_lines?: number | null;
  covered_branches?: number | null;
  total_branches?: number | null;
  duration_ms?: number | null;
  conclusion: ExecutionConclusion;
  results?: CreateTestResultDTO[];
}
