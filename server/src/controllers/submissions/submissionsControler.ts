import { Request, Response } from "express";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionsRepository";
import CreateSubmission from "../../modules/Submissions/Aplication/CreateSubmissionUseCase";
import GetSubmissionsUseCase from "../../modules/Submissions/Aplication/getSubmissionsUseCase";


class SubmissionController{
    private createSubmissionUseCase: CreateSubmission;
    private getSubmissionsUseCase: GetSubmissionsUseCase;

    constructor (repository: SubmissionRepository) {
        this.createSubmissionUseCase = new CreateSubmission(repository);
        this.getSubmissionsUseCase = new GetSubmissionsUseCase(repository);
    }

    async CreateSubmission(req: Request, res: Response): Promise<void>{
        try{
            const { assignmentid, userid, state, link, start_date, end_date, comment } = req.body;
            const newSubmission = await this.createSubmissionUseCase.execute({
                assignmentid,
                userid,
                state,
                link,
                start_date,
                end_date,
                comment
            });
            res.status(201).json(newSubmission);
        } catch (error){
            res.status(500).json({ error: "Server error" });
        }
    }

    async getSubmissions(_req: Request, res: Response): Promise<void> {
        try {
          const assignments = await this.getSubmissionsUseCase.execute();
          res.status(200).json(assignments);
        } catch (error) {
          res.status(500).json({ error: "Server error" });
        }
      }
}

export default SubmissionController;