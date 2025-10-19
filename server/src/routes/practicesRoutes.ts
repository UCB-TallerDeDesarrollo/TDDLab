import express from "express";
import PracticeRepository from "../modules/Practices/repository/PracticeRepository";
import PracticesController from "../controllers/practices/practicesController";

const repository = new PracticeRepository();
const practicesController = new PracticesController(repository);
const practicesRouter = express.Router();

//Create a new Practice
practicesRouter.post(
  "/",
  async (req, res) => await practicesController.createPractice(req, res)
);

//Get all Practices
practicesRouter.get(
  "/",
  async (req, res) => await practicesController.getPractices(req, res)
);

//Get a practice by ID
practicesRouter.get(
  "/:id",
  async (req, res) => await practicesController.getPracticesById(req, res)
);

//Get a practice by UserID
practicesRouter.get(
  "/user/:userid",
  async (req, res) => await practicesController.getPracticesByUserId(req, res)
);

// Update a practice by ID
practicesRouter.put(
  "/:id",
  async (req, res) => await practicesController.updatePractice(req, res)
);

// Delete an assignment by ID
practicesRouter.delete(
  "/:id",
  async (req, res) => await practicesController.deletePractice(req, res)
);

export default practicesRouter;
