import express from "express";
import PracticeRepository from "../modules/Practices/repository/PracticeRepository";
import PracticesController from "../controllers/practices/practicesController";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";

const repository = new PracticeRepository();
const practicesController = new PracticesController(repository);
const practicesRouter = express.Router();

//Create a new Practice
practicesRouter.post(
  "/",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await practicesController.createPractice(req, res)
);

//Get all Practices
practicesRouter.get(
  "/",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await practicesController.getPractices(req, res)
);

//Get a practice by ID
practicesRouter.get(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await practicesController.getPracticesById(req, res)
);

//Get a practice by UserID
practicesRouter.get(
  "/user/:userid",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await practicesController.getPracticesByUserId(req, res)
);

// Update a practice by ID
practicesRouter.put(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await practicesController.updatePractice(req, res)
);

// Delete an assignment by ID
practicesRouter.delete(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await practicesController.deletePractice(req, res)
);

export default practicesRouter;
