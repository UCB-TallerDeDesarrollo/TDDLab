import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { JobDB } from "../Domain/Job";
import { JobRepository } from "../Repositories/TDDCyclesJobsRepository";
import { GithubUseCases } from "../../Github/Application/githubUseCases";

export class JobsUseCase {
    private adapter: JobRepository;
    private githubUseCases: GithubUseCases;

    constructor(repository: JobRepository, githubAdapter: GithubUseCases) {
        this.adapter = repository;
        this.githubUseCases = githubAdapter;
    }
    async execute(owner: string, repoName: string) {
        let jobs;
        try {
            if (!(await this.adapter.repositoryExist(owner, repoName))) {
                const jobs = await this.getJobsFromGithub(owner, repoName);
                const jobsFormatted = await this.getJobsDataFromGithub(owner, repoName, jobs);
                this.saveJobsToDB(owner, repoName, jobsFormatted);
            } else {
                const jobs = await this.getJobsFromGithub(owner, repoName); //getJobsAPI should be changed to getLastJobs once it is implemented
                const newJobs = await this.checkForNewJobs(owner, repoName, jobs);
                const jobsFormatted = await this.getJobsDataFromGithub(owner, repoName, newJobs);
                this.saveJobsToDB(owner, repoName, jobsFormatted);
            }
            jobs = await this.adapter.getJobs(owner, repoName);
        } catch (error) {
            console.error("Error updating jobs table:", error);
            throw new Error("Error updating jobs table");
        }
        return jobs;
    }
    async checkForNewJobs(
        owner: string,
        repoName: string,
        listOfCommitsWithActions: [string, number][]
    ) {
        let jobsToAdd = [];

        for (const currentJob of listOfCommitsWithActions) {
            let row = await this.adapter.checkIfJobExistsInDb(owner, repoName, currentJob[1]);
            if (row.length != 0) break;
            else jobsToAdd.push(currentJob);
        }
        return jobsToAdd;
    }

    async saveJobsToDB(
        owner: string,
        repoName: string,
        jobs: Record<string, JobDataObject>
    ) {
        let jobsFormatted: JobDB[] = [];
        for (const key in jobs) {
            jobsFormatted.push({
                id: jobs[key].jobs[0].run_id,
                sha: jobs[key].jobs[0].head_sha,
                owner: owner,
                reponame: repoName,
                conclusion: jobs[key].jobs[0].conclusion,
            });
        }
        this.adapter.insertRecordsIntoDatabase(jobsFormatted);
    }

    async getJobsFromGithub(owner: string, repoName: string) {
        let jobList: [string, number][] = await this.githubUseCases.obtainRunnedJobsList(owner, repoName); //[commitSha,workflowId][]
        console.log("JOB LIST: ", jobList);
        return jobList
    }
    async getJobsDataFromGithub(owner: string, repoName: string, jobList: [string, number][]) {
        let jobs: Record<string, JobDataObject> = await this.githubUseCases.obtainJobsData(
            owner,
            repoName,
            jobList
        );
        return jobs;
    }
}
