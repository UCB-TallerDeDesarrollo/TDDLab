import express from "express";
import CommitsController from "../controllers/TDDCyclesVisualization/TDDCyclesVisualizationController";
import { CommitRepository } from "../modules/Commits/Repositories/commitRepository";

const repository = new CommitRepository(); // Create an instance of your repository
const TDDCyclesVisualizationController = new CommitsController(repository); // Pass the repository instance to the controller

const commitsRouter = express.Router();

commitsRouter.get(
  "/",
  async (req, res) =>
    await TDDCyclesVisualizationController.getCommits(req, res)
);

export default commitsRouter;
