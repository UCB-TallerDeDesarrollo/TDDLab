import express from "express";
import { BranchSupportRepository } from "../modules/BranchSupport/Repositories/BranchSupportRepository";
import { ProjectUseCases } from "../modules/BranchSupport/Application/ProjectUseCases";
import { BranchUseCases } from "../modules/BranchSupport/Application/BranchUseCases";
import { CommitUseCases } from "../modules/BranchSupport/Application/CommitUseCases";
import { TestExecutionUseCases } from "../modules/BranchSupport/Application/TestExecutionUseCases";
import { GraphDataUseCases } from "../modules/BranchSupport/Application/GraphDataUseCases";
import { SchemaSetupUseCase } from "../modules/BranchSupport/Application/SchemaSetupUseCase";
import { BranchSupportController } from "../controllers/BranchSupport/BranchSupportController";

const repository = new BranchSupportRepository();
const projectUseCases = new ProjectUseCases(repository);
const branchUseCases = new BranchUseCases(repository);
const commitUseCases = new CommitUseCases(repository);
const testExecutionUseCases = new TestExecutionUseCases(repository);
const graphDataUseCases = new GraphDataUseCases(repository);
const schemaSetupUseCase = new SchemaSetupUseCase(repository);

const controller = new BranchSupportController(
  projectUseCases,
  branchUseCases,
  commitUseCases,
  testExecutionUseCases,
  graphDataUseCases,
  schemaSetupUseCase
);

const branchSupportRouter = express.Router();

// ==================== SCHEMA SETUP ====================
branchSupportRouter.post(
  "/setup-schema",
  async (req, res) => await controller.setupSchema(req, res)
);

// ==================== PROJECTS ====================
branchSupportRouter.post(
  "/projects",
  async (req, res) => await controller.createProject(req, res)
);

branchSupportRouter.get(
  "/projects",
  async (req, res) => await controller.getProjects(req, res)
);

branchSupportRouter.get(
  "/projects/:id",
  async (req, res) => await controller.getProjectById(req, res)
);

branchSupportRouter.put(
  "/projects/:id",
  async (req, res) => await controller.updateProject(req, res)
);

branchSupportRouter.delete(
  "/projects/:id",
  async (req, res) => await controller.deleteProject(req, res)
);

// ==================== BRANCHES ====================
branchSupportRouter.post(
  "/projects/:projectId/branches",
  async (req, res) => await controller.createBranch(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/branches",
  async (req, res) => await controller.getBranchesByProject(req, res)
);

branchSupportRouter.get(
  "/branches/:id",
  async (req, res) => await controller.getBranchById(req, res)
);

branchSupportRouter.patch(
  "/branches/:id/head",
  async (req, res) => await controller.updateBranchHead(req, res)
);

branchSupportRouter.put(
  "/branches/:id",
  async (req, res) => await controller.updateBranch(req, res)
);

branchSupportRouter.delete(
  "/branches/:id",
  async (req, res) => await controller.deleteBranch(req, res)
);

// ==================== COMMITS ====================
branchSupportRouter.post(
  "/projects/:projectId/commits",
  async (req, res) => await controller.createCommit(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/commits",
  async (req, res) => await controller.getCommitsByProject(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/commits/:sha",
  async (req, res) => await controller.getCommitBySha(req, res)
);

// ==================== TEST EXECUTIONS ====================
branchSupportRouter.post(
  "/projects/:projectId/test-executions",
  async (req, res) => await controller.createTestExecution(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/test-executions",
  async (req, res) => await controller.getTestExecutionsByProject(req, res)
);

branchSupportRouter.get(
  "/test-executions/:id",
  async (req, res) => await controller.getTestExecutionById(req, res)
);

// ==================== GRAPH & ANALYTICS ====================
branchSupportRouter.get(
  "/projects/:projectId/graph/topology",
  async (req, res) => await controller.getTopologyGraph(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/graph/test-metrics",
  async (req, res) => await controller.getTestMetricsGraph(req, res)
);

branchSupportRouter.get(
  "/projects/:projectId/graph/tdd-cycles",
  async (req, res) => await controller.getTDDCyclesGraph(req, res)
);

export default branchSupportRouter;
