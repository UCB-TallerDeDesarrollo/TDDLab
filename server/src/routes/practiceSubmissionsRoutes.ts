import express from "express";
import PracticeSubmissionRepository from "../modules/PracticeSubmissions/Repository/PracticeSubmissionsRepository";
import PracticeSubmissionController from "../controllers/PracticeSubmissions/PracticeSubmissionsController";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";

const repository = new PracticeSubmissionRepository();
const practiceSubmissionController = new PracticeSubmissionController(
  repository
);

const practiceSubmissionsRouter = express.Router();

practiceSubmissionsRouter.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  async (req, res) =>
    await practiceSubmissionController.CreatePracticeSubmission(req, res)
);

practiceSubmissionsRouter.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) =>
    await practiceSubmissionController.getPracticeSubmissions(req, res)
);

practiceSubmissionsRouter.get(
  "/:practiceid/:userid",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  async (req, res) =>
    await practiceSubmissionController.getPracticeSubmissionByPracticeAndUser(
      req,
      res
    )
);

practiceSubmissionsRouter.get(
  "/:practiceid",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  async (req, res) =>
    await practiceSubmissionController.getPracticeSubmissionsByPracticeId(
      req,
      res
    )
);

practiceSubmissionsRouter.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  async (req, res) =>
    await practiceSubmissionController.updatePracticeSubmission(req, res)
);

practiceSubmissionsRouter.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  async (req, res) =>
    await practiceSubmissionController.deletePracticeSubmission(req, res)
);

export default practiceSubmissionsRouter;
