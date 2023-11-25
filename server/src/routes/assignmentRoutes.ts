import express from "express";
import AssignmentController from "../controllers/Assignments/assignmentController";
import AssignmentRepository from "../modules/Assignments/repositories/AssignmentRepository";
const repository = new AssignmentRepository();
const assignmentController = new AssignmentController(repository);

const assignmentsRouter = express.Router();

// Create a new assignment
assignmentsRouter.post(
  "/",
  async (req, res) => await assignmentController.createAssignment(req, res)
);

// Retrieve all assignments
assignmentsRouter.get(
  "/",
  async (req, res) => await assignmentController.getAssignments(req, res)
);

// Retrieve a specific assignment by ID
assignmentsRouter.get(
  "/:id",
  async (req, res) => await assignmentController.getAssignmentById(req, res)
);

// Update an assignment by ID
assignmentsRouter.put(
  "/:id",
  async (req, res) => await assignmentController.updateAssignment(req, res)
);

// Delete an assignment by ID
assignmentsRouter.delete(
  "/:id",
  async (req, res) => await assignmentController.deleteAssignment(req, res)
);

// Delivery assignment link
assignmentsRouter.put(
  "/:id/deliver",
  async (req, res) => await assignmentController.deliverAssignment(req, res)
);

export default assignmentsRouter;
