import express from "express";
import AssignmentController from "../controllers/assignments/assignmentController"; // Import your controller class
import AssignmentRepository from "../modules/Assignments/repositories/AssignmentRepository";
const repository = new AssignmentRepository(); // Create an instance of your repository
const assignmentController = new AssignmentController(repository); // Pass the repository instance to the controller
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";

const assignmentsRouter = express.Router();

// Create a new assignment
assignmentsRouter.post(
  "/",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await assignmentController.createAssignment(req, res)
);

// Retrieve all assignments
assignmentsRouter.get(
  "/",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await assignmentController.getAssignments(req, res)
);

// Retrieve a specific assignment by ID
assignmentsRouter.get(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await assignmentController.getAssignmentById(req, res)
);

// Update an assignment by ID
assignmentsRouter.put(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await assignmentController.updateAssignment(req, res)
);

// Delete an assignment by ID
assignmentsRouter.delete(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await assignmentController.deleteAssignment(req, res)
);

assignmentsRouter.get(
  "/groupid/:groupid",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req,res) => await assignmentController.getAssignmentsByGroupId(req, res)
);

// Delivery assignment link
assignmentsRouter.put(
  "/:id/deliver",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await assignmentController.deliverAssignment(req, res)
);

export default assignmentsRouter;
