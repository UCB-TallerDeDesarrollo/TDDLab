import { jobRepository } from "../Repositories/jobRepository";
import { updateJobsTable } from "./updateJobsTable";
// import { Job } from "../../domain/models/Job";

export const getJobs = async (
  owner: string,
  repoName: string,
  Adapter: jobRepository = new jobRepository()
) => {
  try {
    await updateJobsTable(owner, repoName, Adapter);
    const Jobs = await Adapter.getJobs(owner, repoName);
    return Jobs;
  } catch (error) {
    console.error("Error updating jobs table:", error);
    return { error: "Error updating jobs table" };
  }
};
