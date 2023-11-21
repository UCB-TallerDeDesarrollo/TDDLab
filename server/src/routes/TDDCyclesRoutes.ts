import express from "express";
import { CommitRepository } from "../modules/TDDCycles/Repositories/TDDCyclesCommitsRepository";
import { JobRepository } from "../modules/TDDCycles/Repositories/TDDCyclesJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/TDDCyclesGithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";

// Create instances of your repositories
const commitsRepository = new CommitRepository();
const jobsRepository = new JobRepository();
const githubRepository = new GithubRepository();

// Create an instance of your controller
const _TDDCyclesController = new TDDCyclesController(commitsRepository, jobsRepository, githubRepository);

// Create a new router to handle the TDDCycles routes
const TDDCyclesRouter = express.Router();

// Get all commits from a repository in Github (TDD Cycles)
TDDCyclesRouter.get("/commits", async (req, res) => await _TDDCyclesController.getTDDCycles(req, res));

// Get all test outcomes from a repository in Github
TDDCyclesRouter.get("/jobs", async (req, res) => await _TDDCyclesController.getTestOutcomes(req, res));



export default TDDCyclesRouter;
