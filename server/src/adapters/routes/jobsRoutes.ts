import express from 'express';
import { getJobs ,saveJobs } from '../../application/usecases/jobUseCases';

const jobsRouter = express.Router();


jobsRouter.post('/', saveJobs);
jobsRouter.get('/', getJobs);

export default jobsRouter;
