import express from "express";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";


const TDDCycles = express.Router();
const commitsRepository = new CommitsRepository();
const jobsRepository = new JobsRepository();
const TDDCyclesController = new TDDCyclesController(commitsRepository, jobsRepository)

TDDCycles.get("/", async (req, res) => await TDDCyclesController.getCommits(req, res));



export default TDDCycles;
