import express from "express";
import SubmissionRepository from "../modules/Submissions/Repository/SubmissionsRepository";
import SubmissionController from "../controllers/submissions/submissionsController";

const repository = new SubmissionRepository();
const submissionController = new SubmissionController(repository);

const submissionsRouter = express.Router();

// Create a new submission
submissionsRouter.post(
    "/",
    async (req, res) => await submissionController.CreateSubmission(req, res)
  );

// Retrieve all assignments
submissionsRouter.get(
  "/",
  async (req, res) => await submissionController.getSubmissions(req, res)
);

// Retrieve a submission by assignmentid and userid
submissionsRouter.get(
  "/:assignmentid/:userid",
  async (req, res) => await submissionController.getSubmissionByAssignmentAndUser(req, res)
);

// Get submissions by assignmentid
submissionsRouter.get(
  "/:assignmentid",
  async (req, res) => await submissionController.getSubmissionsByAssignmentId(req, res)
);

// Update a Submission by ID
submissionsRouter.put(
  "/:id",
  async (req, res) => await submissionController.updateSubmission(req, res)
);

// Delete a submissiom by ID
submissionsRouter.delete(
  "/:id",
  async (req, res) => await submissionController.deleteSubmission(req, res)
);

export default submissionsRouter;