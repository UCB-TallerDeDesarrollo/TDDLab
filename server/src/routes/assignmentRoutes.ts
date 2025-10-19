import express from "express";
import AssignmentController from "../controllers/assignments/assignmentController"; // Import your controller class
import AssignmentRepository from "../modules/Assignments/repositories/AssignmentRepository";
const repository = new AssignmentRepository(); // Create an instance of your repository
const assignmentController = new AssignmentController(repository); // Pass the repository instance to the controller

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

assignmentsRouter.get(
  "/groupid/:groupid",
  async (req,res) => await assignmentController.getAssignmentsByGroupId(req, res)
);

// Delivery assignment link
assignmentsRouter.put(
  "/:id/deliver",
  async (req, res) => await assignmentController.deliverAssignment(req, res)
);

export default assignmentsRouter;
