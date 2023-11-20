import express from "express";
import CommitsController from "../controllers/Commits/commitsController";
import { CommitRepository } from "../modules/Commits/Repositories/commitRepository";

const repository = new CommitRepository(); // Create an instance of your repository
const commitsController = new CommitsController(repository); // Pass the repository instance to the controller

const commitsRouter = express.Router();

commitsRouter.get(
  "/",
  async (req, res) => await commitsController.getCommits(req, res)
);

export default commitsRouter;
