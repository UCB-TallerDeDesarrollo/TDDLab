import express from "express";
import { TeacherCommentController } from "../controllers/teacherCommentsOnSubmissions/teacherCommentsOnSubmissionsController"; 
import { PostgresTeacherCommentRepository } from "../modules/TeacherCommentsOnSubmissions/Infrastructure/PostgresTeacherCommentRepository";
import { ITeacherCommentRepository } from "../modules/TeacherCommentsOnSubmissions/Domain/ITeacherCommentRepository";

const teacherCommentRepository: ITeacherCommentRepository = new PostgresTeacherCommentRepository();
const teacherCommentController = new TeacherCommentController(teacherCommentRepository);

const teacherCommentsOnSubmissionRouter = express.Router();

teacherCommentsOnSubmissionRouter.post("/", (req, res) => teacherCommentController.addComment(req, res));

teacherCommentsOnSubmissionRouter.get("/:submission_id", (req, res) => teacherCommentController.getComments(req, res));

export default teacherCommentsOnSubmissionRouter;
