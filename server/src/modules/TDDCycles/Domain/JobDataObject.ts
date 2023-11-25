export interface JobDataObject {
  total_count: number;
  jobs: Job[];
}

export interface Job {
  id: number;
  run_id: number;
  workflow_name: string;
  head_branch: string;
  run_url: string;
  run_attempt: number;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
  status: string;
  conclusion: string;
  created_at: Date;
  started_at: Date;
  completed_at: Date;
  name: string;
  steps: Step[];
  check_run_url: string;
  labels: string[];
  runner_id: number;
  runner_name: string;
  runner_group_id: number;
  runner_group_name: string;
}

export interface Step {
  name: string;
  status: string;
  conclusion: string;
  number: number;
  started_at: Date;
  completed_at: Date;
}
