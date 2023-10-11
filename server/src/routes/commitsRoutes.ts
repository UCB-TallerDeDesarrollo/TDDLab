import express from "express";
import { getCommitsOfRepo } from "../modules/Commits/Application/commitUseCases";

const commitsRouter = express.Router();

//commitsRouter.post('/', saveOneCommitInfo);

commitsRouter.get("/", getCommitsOfRepo);
export default commitsRouter;
