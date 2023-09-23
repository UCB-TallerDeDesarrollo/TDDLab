// src/adapters/controllers/assignments/index.ts
import express from 'express';
import { getAssignments, createAssignment } from '../controllers/assignments/assignmentController';

const assignmentsRouter = express.Router();

// Define assignment-related routes here
assignmentsRouter.get('/api/assignment', getAssignments);
assignmentsRouter.post('/api/assignment', createAssignment);


export default assignmentsRouter;
