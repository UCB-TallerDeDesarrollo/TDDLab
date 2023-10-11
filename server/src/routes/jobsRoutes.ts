import express from "express";
import { getJobs } from "../modules/Jobs/Application/jobUseCases";

const jobsRouter = express.Router();

// jobsRouter.post('/', saveJobs);
jobsRouter.get("/", getJobs);

export default jobsRouter;
