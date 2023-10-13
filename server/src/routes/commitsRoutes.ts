import express from "express";
import CommitsController from "../controllers/Commits/commitsController";


const commitsRouter = express.Router();
const commitsController = new CommitsController()

commitsRouter.get("/", async(req,res)=> await commitsController.getCommits(req,res));



export default commitsRouter;
