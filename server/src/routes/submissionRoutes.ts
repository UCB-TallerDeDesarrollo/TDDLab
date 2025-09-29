import express from "express";
import SubmissionRepository from "../modules/Submissions/Repository/SubmissionsRepository";
import SubmissionController from "../controllers/submissions/submissionsController";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";

const repository = new SubmissionRepository();
const submissionController = new SubmissionController(repository);

const submissionsRouter = express.Router();

// Create a new submission
submissionsRouter.post(
    "/",
      authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
    async (req, res) => await submissionController.CreateSubmission(req, res)
  );

// Retrieve all assignments
submissionsRouter.get(
  "/",
        authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await submissionController.getSubmissions(req, res)
);

// Retrieve a submission by assignmentid and userid
submissionsRouter.get(
  "/:assignmentid/:userid",
        authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await submissionController.getSubmissionByAssignmentAndUser(req, res)
);

// Get submissions by assignmentid
submissionsRouter.get(
  "/:assignmentid",
        authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await submissionController.getSubmissionsByAssignmentId(req, res)
);

// Update a Submission by ID
submissionsRouter.put(
  "/:id",
        authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await submissionController.updateSubmission(req, res)
);

// Delete a submissiom by ID
submissionsRouter.delete(
  "/:id",
        authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await submissionController.deleteSubmission(req, res)
);

export default submissionsRouter;