import express from "express";
import { GithubRepositoryBranchSupport } from "../modules/TDDCycles/Repositories/GithubRepositoryBranchSupport";
import { TDDCyclesControllerBranchSupport } from "../controllers/TDDCycles/TDDCyclesControllerBranchSupport";

const githubRepositoryBranchSupport = new GithubRepositoryBranchSupport();
const controller = new TDDCyclesControllerBranchSupport(githubRepositoryBranchSupport);

const TDDCyclesRoutesBranchSupport = express.Router();

TDDCyclesRoutesBranchSupport.get(
  "/commits-history",
  async (req, res) => await controller.getCommitHistory(req, res)
);

TDDCyclesRoutesBranchSupport.get(
  "/commit-cycles",
  async (req, res) => await controller.getCommitCycles(req, res)
);

TDDCyclesRoutesBranchSupport.get(
  "/branches",
  async (req, res) => await controller.getBranches(req, res)
);

TDDCyclesRoutesBranchSupport.get(
  "/test-executions",
  async (req, res) => await controller.getTestExecutions(req, res)
);

TDDCyclesRoutesBranchSupport.get(
  "/topology",
  async (req, res) => await controller.getTopologyGraph(req, res)
);

export default TDDCyclesRoutesBranchSupport;
