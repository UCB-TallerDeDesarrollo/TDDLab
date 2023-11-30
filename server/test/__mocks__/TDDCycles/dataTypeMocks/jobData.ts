import { JobDataObject } from "../../../../src/modules/TDDCycles/Domain/JobDataObject";


export const githubActionsRunsList: [string, number][] = [["run1", 1], ["run2", 0]];
export const jobsToSave: [string, number][] = ["run1"].map((run) => [run, 1]);
export const jobs: JobDataObject[] = [];
export const jobsFormatted: Record<string, JobDataObject> = { job1: {} as JobDataObject, job2: {} as JobDataObject };