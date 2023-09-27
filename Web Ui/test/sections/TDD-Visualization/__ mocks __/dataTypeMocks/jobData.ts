import { JobDataObject } from "../../../../../src/TDD-Visualization/domain/jobInterfaces";

export const mockSuccessJobData: JobDataObject = {
  total_count: 1,
  jobs: [
    {
      id: 8812972390,
      run_id: 3223439322,
      workflow_name: "javascript-CI",
      head_branch: "main",
      run_url:
        "https://api.github.com/repos/DwijanX/Bulls-and-Cows/actions/runs/3223439322",
      run_attempt: 1,
      node_id: "CR_kwDOIGiCEM8AAAACDUtJZg",
      head_sha: "d90a2592f04d722a956097e4a0d8da6113d05222",
      url: "https://api.github.com/repos/DwijanX/Bulls-and-Cows/actions/jobs/8812972390",
      html_url:
        "https://github.com/DwijanX/Bulls-and-Cows/actions/runs/3223439322/job/8812972390",
      status: "completed",
      conclusion: "success",
      created_at: new Date("2022-10-11T01:15:23Z"),
      started_at: new Date("2022-10-11T01:15:29Z"),
      completed_at: new Date("2022-10-11T01:16:13Z"),
      name: "ci_to_main",
      steps: [
        {
          name: "Set up job",
          status: "completed",
          conclusion: "success",
          number: 1,
          started_at: new Date("2022-10-11T01:15:28.000Z"),
          completed_at: new Date("2022-10-11T01:15:31.000Z"),
        },
      ],
      check_run_url:
        "https://api.github.com/repos/DwijanX/Bulls-and-Cows/check-runs/8812972390",
      labels: ["ubuntu-latest"],
      runner_id: 1,
      runner_name: "Hosted Agent",
      runner_group_id: 2,
      runner_group_name: "GitHub Actions",
    },
  ],
};
export const mockFailedJobData: JobDataObject = {
  total_count: 1,
  jobs: [
    {
      id: 8812972390,
      run_id: 3223439322,
      workflow_name: "javascript-CI",
      head_branch: "main",
      run_url:
        "https://api.github.com/repos/DwijanX/Bulls-and-Cows/actions/runs/3223439322",
      run_attempt: 1,
      node_id: "CR_kwDOIGiCEM8AAAACDUtJZg",
      head_sha: "d90a2592f04d722a956097e4a0d8da6113d05222",
      url: "https://api.github.com/repos/DwijanX/Bulls-and-Cows/actions/jobs/8812972390",
      html_url:
        "https://github.com/DwijanX/Bulls-and-Cows/actions/runs/3223439322/job/8812972390",
      status: "completed",
      conclusion: "failure",
      created_at: new Date("2022-10-11T01:15:23Z"),
      started_at: new Date("2022-10-11T01:15:29Z"),
      completed_at: new Date("2022-10-11T01:16:13Z"),
      name: "ci_to_main",
      steps: [
        {
          name: "Set up job",
          status: "completed",
          conclusion: "success",
          number: 1,
          started_at: new Date("2022-10-11T01:15:28.000Z"),
          completed_at: new Date("2022-10-11T01:15:31.000Z"),
        },
      ],
      check_run_url:
        "https://api.github.com/repos/DwijanX/Bulls-and-Cows/check-runs/8812972390",
      labels: ["ubuntu-latest"],
      runner_id: 1,
      runner_name: "Hosted Agent",
      runner_group_id: 2,
      runner_group_name: "GitHub Actions",
    },
  ],
};
