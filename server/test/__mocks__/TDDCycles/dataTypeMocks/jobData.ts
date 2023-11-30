import { JobDataObject } from "../../../../src/modules/TDDCycles/Domain/JobDataObject";


export const githubActionsRunsList: [string, number][] = [["run1", 1], ["run2", 0]];
export const jobsToSave: [string, number][] = ["run1"].map((run) => [run, 1]);
export const mockJobDataObject: JobDataObject = {
    total_count: 1,
    jobs: [
        {
            id: 1,
            run_id: 123,
            workflow_name: "Test Workflow",
            head_branch: "main",
            run_url: "https://github.com/owner/repo/actions/runs/123",
            run_attempt: 1,
            node_id: "MDIzOlJ1blJ1bjEyMw==",
            head_sha: "abc123",
            url: "https://api.github.com/repos/owner/repo/actions/runs/123",
            html_url: "https://github.com/owner/repo/actions/runs/123",
            status: "completed",
            conclusion: "success",
            created_at: new Date(),
            started_at: new Date(),
            completed_at: new Date(),
            name: "Test Job",
            steps: [
                {
                    name: "Test Step",
                    status: "completed",
                    conclusion: "success",
                    number: 1,
                    started_at: new Date(),
                    completed_at: new Date(),
                },
            ],
            check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123",
            labels: ["label1", "label2"],
            runner_id: 1,
            runner_name: "runner-1",
            runner_group_id: 1,
            runner_group_name: "group-1",
        },
    ],
};
export const jobsFormatted: Record<string, JobDataObject> = { job1: mockJobDataObject };