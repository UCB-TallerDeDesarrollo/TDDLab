import express from "express";
import PracticeSubmissionRepository from "../modules/PracticeSubmissions/Repository/PracticeSubmissionsRepository";
import PracticeSubmissionController from "../controllers/PracticeSubmissions/PracticeSubmissionsController";

const repository = new PracticeSubmissionRepository();
const practiceSubmissionController = new PracticeSubmissionController(repository);

const practiceSubmissionsRouter = express.Router();

practiceSubmissionsRouter.post(
    "/",
    async (req, res) => await practiceSubmissionController.CreatePracticeSubmission(req, res)
  );

practiceSubmissionsRouter.get(
  "/",
  async (req, res) => await practiceSubmissionController.getPracticeSubmissions(req, res)
);

practiceSubmissionsRouter.get(
  "/:practiceid/:userid",
  async (req, res) => await practiceSubmissionController.getPracticeSubmissionByPracticeAndUser(req, res)
);

practiceSubmissionsRouter.get(
  "/:practiceid",
  async (req, res) => await practiceSubmissionController.getPracticeSubmissionsByPracticeId(req, res)
);

practiceSubmissionsRouter.put(
  "/:id",
  async (req, res) => await practiceSubmissionController.updatePracticeSubmission(req, res)
);

practiceSubmissionsRouter.delete(
  "/:id",
  async (req, res) => await practiceSubmissionController.deletePracticeSubmission(req, res)
);

export default practiceSubmissionsRouter;