import express from "express";
import { TDDCyclesPort } from "../modules/Github/Application/githubUseCases";

const githubRouter = express.Router();


let githubUseCases = new TDDCyclesPort();

// jobsRouter.post('/', saveJobs);
githubRouter.get(
    "/commits",
    async (req, res) => await githubUseCases.obtainCommitsOfRepo(req, res)
  );
  
export default githubRouter;
