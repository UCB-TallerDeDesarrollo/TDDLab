import express from "express";
import { TeacherCommentController } from "../controllers/teacherCommentsOnSubmissions/teacherCommentsOnSubmissionsController"; 
import { TeacherCommentRepository } from "../modules/TeacherCommentsOnSubmissions/Repositories/TeacherCommentRepository";

const teacherCommentRepository = new TeacherCommentRepository();
const teacherCommentController = new TeacherCommentController(teacherCommentRepository); // Pasar el repositorio al controlador

const teacherCommentsOnSubmissionRouter = express.Router();

teacherCommentsOnSubmissionRouter.post("/", (req, res) => teacherCommentController.addComment(req, res));

// Ruta para obtener comentarios por ID de entrega
teacherCommentsOnSubmissionRouter.get("/:submission_id", (req, res) => teacherCommentController.getComments(req, res));

export default teacherCommentsOnSubmissionRouter;
