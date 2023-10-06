import express from 'express';
import { saveOneCommitInfo } from '../../application/usecases/commitUseCases';

const commitsRouter = express.Router();

commitsRouter.post('/', saveOneCommitInfo);


export default commitsRouter;
