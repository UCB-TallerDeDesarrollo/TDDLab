// src/adapters/controllers/assignments/index.ts
import express from 'express';
import { getAssignments, createAssignment } from '../controllers/assignments/assignmentController';

const assignmentsRouter = express.Router();

// Define assignment-related routes here
assignmentsRouter.get('/get', getAssignments);
assignmentsRouter.post('/create', createAssignment);


export default assignmentsRouter;
