import express from "express";
import SubmissionRepository from "../modules/Submissions/Repository/SubmissionsRepository";
import SubmissionController from "../controllers/submissions/submissionsControler";

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

// Update an assignment by ID
submissionsRouter.put(
  "/:id",
  async (req, res) => await submissionController.updateSubmission(req, res)
);
export default submissionsRouter;