import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { JobDB } from "../Domain/Job";
import { JobRepository } from "../Repositories/TDDCyclesJobsRepository";
import { GithubRepository } from '../Repositories/TDDCyclesGithubRepository';

export class JobsUseCase {
    private jobRepository: JobRepository;
    private githubRepository: GithubRepository;

    constructor(jobRepository: JobRepository, githubRepository: GithubRepository) {
        this.jobRepository = jobRepository;
        this.githubRepository = githubRepository;
    }
    async execute(owner: string, repoName: string) {
        let jobs;
        try {
            if (!(await this.jobRepository.repositoryExists(owner, repoName))) {
                const jobs = await this.getJobsFromGithub(owner, repoName);
                const jobsFormatted = await this.getJobsDataFromGithub(owner, repoName, jobs);
                this.saveJobsToDB(owner, repoName, jobsFormatted);
            } else {
                const jobs = await this.getJobsFromGithub(owner, repoName); //getJobsAPI should be changed to getLastJobs once it is implemented
                const newJobs = await this.getJobsNotSavedInDB(owner, repoName, jobs);
                const jobsFormatted = await this.getJobsDataFromGithub(owner, repoName, newJobs);
                this.saveJobsToDB(owner, repoName, jobsFormatted);
            }
            jobs = await this.jobRepository.getJobs(owner, repoName);
        } catch (error) {
            console.error("Error updating jobs table:", error);
            throw new Error("Error updating jobs table");
        }
        return jobs;
    }
    async getJobsNotSavedInDB(
        owner: string,
        repoName: string,
        commitsWithActions: [string, number][]
    ) {
        let jobsToAdd = [];

        for (const currentJob of commitsWithActions) {
            let row = await this.jobRepository.checkIfJobExistsInDb(owner, repoName, currentJob[1]);
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
        let jobsFormatted: JobDB[] = Object.values(jobs).map(job => ({
            id: job.jobs[0].run_id,
            sha: job.jobs[0].head_sha,
            owner: owner,
            reponame: repoName,
            conclusion: job.jobs[0].conclusion,
        }));

        await Promise.all(jobsFormatted.map(job => this.jobRepository.saveJob(job)));
    }

    async getJobsFromGithub(owner: string, repoName: string) {
        let jobList: [string, number][] = await this.githubRepository.obtainRunnedJobsList(owner, repoName); //[commitSha,workflowId][]
        return jobList
    }
    async getJobsDataFromGithub(owner: string, repoName: string, jobList: [string, number][]) {
        let jobs: Record<string, JobDataObject> = await this.githubRepository.obtainJobsData(
            owner,
            repoName,
            jobList
        );
        return jobs;
    }
}
