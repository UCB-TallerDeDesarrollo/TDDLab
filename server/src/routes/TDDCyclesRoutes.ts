import express from "express";
import { CommitRepository } from "../modules/TDDCycles/Repositories/TDDCyclesCommitsRepository";
import { JobRepository } from "../modules/TDDCycles/Repositories/TDDCyclesJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/TDDCyclesGithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";

const commitsRepository = new CommitRepository();
const jobsRepository = new JobRepository();
const githubRepository = new GithubRepository();


const _TDDCyclesController = new TDDCyclesController(commitsRepository, jobsRepository, githubRepository);

const TDDCyclesRouter = express.Router();

TDDCyclesRouter.get("/commits", async (req, res) => await _TDDCyclesController.getCommits(req, res));

TDDCyclesRouter.get("/jobs", async (req, res) => await _TDDCyclesController.getTestOutcomes(req, res));



export default TDDCyclesRouter;
