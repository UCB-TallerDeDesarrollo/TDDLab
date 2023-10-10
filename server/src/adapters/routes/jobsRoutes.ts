import express from 'express';
import { getJobs } from '../../application/usecases/jobUseCases';

const jobsRouter = express.Router();


// jobsRouter.post('/', saveJobs);
jobsRouter.get('/', getJobs);

export default jobsRouter;
