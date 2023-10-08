import { jobRepository } from "../../adapters/dataBaseRepositories/jobRepository";
import { Job } from "../../domain/models/Job";
import { Request, Response } from 'express';

const Adapter = new jobRepository()

export const getJobs = async (req: Request, res: Response) => {
    
};

export const saveJobs = async (req: Request, res: Response) => {
   
};