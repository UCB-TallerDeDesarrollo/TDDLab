import express from "express";
import CommitsController from "../controllers/Commits/commitsController";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";


const TDDCycles = express.Router();

const TDDCyclesController = new TDDCyclesController()

TDDCycles.get("/", async(req,res)=> await commitsController.getCommits(req,res));



export default TDDCycles;
