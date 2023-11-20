import { JobRepository } from "../Repositories/TDDCycleRepository";
import { UpdateJobsTable } from "./updateJobsTable";
import { GithubUseCases } from "../../Github/Application/githubUseCases";

export class JobsUseCase {
    private updateJobsTable: UpdateJobsTable;
    private repository: JobRepository;
    private githubUseCases: GithubUseCases;

    constructor(repository: JobRepository, githubAdapter: GithubUseCases) {
        this.repository = repository;
        this.githubUseCases = githubAdapter;
        this.updateJobsTable = new UpdateJobsTable(
            this.repository,
            this.githubUseCases
        );
    }

    async getJobs(owner: string, repoName: string) {
        let jobs;
        try {
            if (!(await this.repository.repositoryExist(owner, repoName))) {
                const jobs = await this.updateJobsTable.getJobsAPI(owner, repoName);
                const jobsFormatted = await this.updateJobsTable.getJobsData(owner, repoName, jobs);
                this.updateJobsTable.saveJobsDB(owner, repoName, jobsFormatted);
            } else {
                const jobs = await this.updateJobsTable.getJobsAPI(owner, repoName); //getJobsAPI should be changed to getLastJobs once it is implemented
                const newJobs = await this.updateJobsTable.checkForNewJobs(owner, repoName, jobs);
                const jobsFormatted = await this.updateJobsTable.getJobsData(owner, repoName, newJobs);
                this.updateJobsTable.saveJobsDB(owner, repoName, jobsFormatted);
            }
            jobs = await this.repository.getJobs(owner, repoName);
        } catch (error) {
            console.error("Error updating jobs table:", error);
            throw new Error("Error updating jobs table");
        }
        return jobs;
    }
}
