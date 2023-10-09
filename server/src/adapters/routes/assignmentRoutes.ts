import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  deleteAssignment,
  updateAssignment
} from '../controllers/assignments/assignmentController';

const assignmentsRouter = express.Router();

// Create a new assignment
assignmentsRouter.post('/', createAssignment);

// Retrieve all assignments
assignmentsRouter.get('/', getAssignments);

// Retrieve a specific assignment by ID
assignmentsRouter.get('/:id', getAssignmentById);

// Update an assignment by ID
assignmentsRouter.put('/:id', updateAssignment);

// Delete an assignment by ID
assignmentsRouter.delete('/:id', deleteAssignment);

export default assignmentsRouter;
