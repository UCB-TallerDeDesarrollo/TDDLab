import express from "express";
import { GithubRepository } from "../modules/TDDCycles/Repositories/GithubRepository";
import { DBBranchRepository } from "../modules/TDDCycles/Repositories/DBBranchRepository";
import BranchController from "../controllers/TDDCycles/BranchController";

const githubRepository = new GithubRepository();
const dbBranchRepository = new DBBranchRepository();

const branchController = new BranchController(githubRepository, dbBranchRepository);

const branchRouter = express.Router();

// Get branch history (new DB model with .new_gen fallback to old path)
branchRouter.get(
  "/branches/history",
  async (req, res) => await branchController.getBranchHistory(req, res)
);

// List branches (new DB model with .new_gen fallback to default "main")
branchRouter.get(
  "/branches",
  async (req, res) => await branchController.getBranches(req, res)
);

// List merges (new DB model)
branchRouter.get(
  "/merges",
  async (req, res) => await branchController.getMerges(req, res)
);

// Insert branch and its commits/merges into the database (new model)
branchRouter.post(
  "/branches",
  async (req, res) => await branchController.saveBranch(req, res)
);

export default branchRouter;
