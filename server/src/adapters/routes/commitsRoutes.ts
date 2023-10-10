import express from 'express';
import { getCommitsOfRepo } from '../../application/usecases/commitUseCases';

const commitsRouter = express.Router();

//commitsRouter.post('/', saveOneCommitInfo);

commitsRouter.get('/', getCommitsOfRepo);
export default commitsRouter;
