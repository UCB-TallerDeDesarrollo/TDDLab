import express from "express";
import JobsController from "../controllers/Jobs/jobsController";

const jobsRouter = express.Router();
const jobsController=new JobsController()

jobsRouter.get("/", async(req,res)=> await jobsController.getJobs(req,res));

export default jobsRouter;
