import express from "express";
import { CommitRepository } from "../modules/TDDCycles/Repositories/TDDCycleCommitsRepository";
import { JobRepository } from "../modules/TDDCycles/Repositories/TDDCycleJobsRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";

const commitsRepository = new CommitRepository();
const jobsRepository = new JobRepository();

const _TDDCyclesController = new TDDCyclesController(jobsRepository, commitsRepository);

const TDDCycles = express.Router();

TDDCycles.get("/", async (req, res) => await _TDDCyclesController.getCommits(req, res));

TDDCycles.get("/", async (req, res) => await _TDDCyclesController.getTestOutcomes(req, res));



export default TDDCycles;
