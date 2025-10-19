import { Request, Response } from "express";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionsRepository";
import CreateSubmission from "../../modules/Submissions/Aplication/CreateSubmissionUseCase";
import GetSubmissionsUseCase from "../../modules/Submissions/Aplication/getSubmissionsUseCase";
import UpdateSubmission from "../../modules/Submissions/Aplication/updateSubmissionUSeCase";
import DeleteSubmission from "../../modules/Submissions/Aplication/DeleteSubmissionUseCase";
import GetSubmissionUseCase from "../../modules/Submissions/Aplication/getSubmissionUseCase";
import GetSubmissionsByAssignmentIdUseCase from "../../modules/Submissions/Aplication/getSubmissionsByAssignmentIdUseCase";

class SubmissionController {
  private readonly createSubmissionUseCase: CreateSubmission;
  private readonly getSubmissionsUseCase: GetSubmissionsUseCase;
  private readonly updateSubmissionUseCase: UpdateSubmission;
  private readonly deleteSubmissionUSeCase: DeleteSubmission;
  private readonly getSubmissionUseCase: GetSubmissionUseCase;
  private readonly getSubmissionsByAssignmentIdUseCase: GetSubmissionsByAssignmentIdUseCase;

  constructor(repository: SubmissionRepository) {
    this.createSubmissionUseCase = new CreateSubmission(repository);
    this.getSubmissionsUseCase = new GetSubmissionsUseCase(repository);
    this.getSubmissionUseCase = new GetSubmissionUseCase(repository);
    this.updateSubmissionUseCase = new UpdateSubmission(repository);
    this.deleteSubmissionUSeCase = new DeleteSubmission(repository);
    this.getSubmissionsByAssignmentIdUseCase =
      new GetSubmissionsByAssignmentIdUseCase(repository);
  }

  async CreateSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentid, userid, status, repository_link, start_date } =
        req.body;
      const newSubmission = await this.createSubmissionUseCase.execute({
        assignmentid,
        userid,
        status,
        repository_link,
        start_date,
      });
      res.status(201).json(newSubmission);
    } catch (error) {
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
  async getSubmissionByAssignmentAndUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const assignmentid = parseInt(req.params.assignmentid);
      const userid = parseInt(req.params.userid);
      const submission = await this.getSubmissionUseCase.execute(
        assignmentid,
        userid
      );
      console.log("------------------------------------------------x")
      console.log("getSubmissionByAssignmentAndUser")
      console.log("assigmentid", assignmentid);
      console.log("userid", userid);
      console.log("submissionnnnnnnnnnnnn")
      console.log(submission)
      console.log("------------------------------------------------y")
      if (submission) {
        console.log("submission", submission)
        res.status(200).json(submission);
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateSubmission(req: Request, res: Response): Promise<void> {
    try {
      const submissionid = parseInt(req.params.id);
      const { status, end_date, comment } = req.body;
      const updatedSubmission = await this.updateSubmissionUseCase.execute(
        submissionid,
        {
          status,
          end_date,
          comment,
        }
      );
      if (updatedSubmission) {
        res.status(200).json(updatedSubmission);
      } else {
        res.status(404).json({ error: "Submission not found" });
      }
    } catch (error) {
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

  async getSubmissionsByAssignmentId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const assignmentid = parseInt(req.params.assignmentid, 10);
      const assignments =
        await this.getSubmissionsByAssignmentIdUseCase.execute(assignmentid);
      console.log("assigments");
      console.log(assignments);
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Error getSubmissionsByAssignmentId" });
    }
  }
}

export default SubmissionController;
