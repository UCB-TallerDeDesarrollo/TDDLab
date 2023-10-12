import express from "express";
import { TDDCyclesPort } from "../modules/Github/Application/githubUseCases";

const githubRouter = express.Router();

let githubUseCases = new TDDCyclesPort();

// jobsRouter.post('/', saveJobs);
githubRouter.get(
  "/commits",
  async (req, res) => await githubUseCases.obtainCommitsOfRepo(req, res)
);
githubRouter.get(
  "/commit/sha",
  async (req, res) => await githubUseCases.obtainCommitsFromSha(req, res)
);
githubRouter.get(
  "/jobs",
  async (req, res) => await githubUseCases.obtainJobsData(req, res)
);

export default githubRouter;
