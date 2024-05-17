import { Request, Response } from "express";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionsRepository";
import CreateSubmission from "../../modules/Submissions/Aplication/CreateSubmissionUseCase";
import GetSubmissionsUseCase from "../../modules/Submissions/Aplication/getSubmissionsUseCase";
import UpdateSubmission from "../../modules/Submissions/Aplication/updateSubmissionUSeCase";
import DeleteSubmission from "../../modules/Submissions/Aplication/DeleteSubmissionUseCase";


class SubmissionController{
    private createSubmissionUseCase: CreateSubmission;
    private getSubmissionsUseCase: GetSubmissionsUseCase;
    private updateSubmissionUseCase: UpdateSubmission;
    private deleteSubmissionUSeCase: DeleteSubmission;

    constructor (repository: SubmissionRepository) {
        this.createSubmissionUseCase = new CreateSubmission(repository);
        this.getSubmissionsUseCase = new GetSubmissionsUseCase(repository);
        this.updateSubmissionUseCase = new UpdateSubmission(repository);
        this.deleteSubmissionUSeCase = new DeleteSubmission(repository);
    }

    async CreateSubmission(req: Request, res: Response): Promise<void>{
        try{
            const { assignmentid, userid, status, repository_link, start_date} = req.body;
            const newSubmission = await this.createSubmissionUseCase.execute({
                assignmentid,
                userid,
                status,
                repository_link,
                start_date
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

    async updateSubmission(req: Request, res: Response): Promise<void> {
        try{
            const submissionid = parseInt(req.params.id);
            const {
                status,
                end_date,
                comment
            } = req.body;
            const updatedSubmission = await this.updateSubmissionUseCase.execute(
                submissionid,
                {
                    status,
                    end_date,
                    comment                    
                }
            );
            if(updatedSubmission){
                res.status(200).json(updatedSubmission);
            }else{
                res.status(404).json({ error: "Submission not found" });
            }
        }catch (error){
            res.status(500).json({ error: "Server error" });
        }
    }

    async deleteSubmission(req: Request, res: Response): Promise<void> {
        try {
          const submissionid = parseInt(req.params.id);
          await this.deleteSubmissionUSeCase.execute(submissionid);
          res.status(204).send();
        } catch (error) {
          res.status(500).json({ error: "Server error" });
        }
      }
}

export default SubmissionController;