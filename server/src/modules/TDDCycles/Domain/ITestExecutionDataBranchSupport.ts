export interface TestExecutionDataBranchSupport {
  id: string;
  commit_sha?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  source: "local" | "ci";
  executed_at: Date;
  timestamp: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  error_tests: number;
  coverage?: number | null;
  duration_ms?: number | null;
  conclusion: "success" | "failure" | "cancelled" | "error";
  success: boolean;

  // Compatibility aliases for frontend components expecting tdd_log format:
  numTotalTests: number;
  numPassedTests: number;
  testId?: number;
}
