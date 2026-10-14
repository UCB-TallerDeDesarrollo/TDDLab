import { Request, Response } from "express";
import PracticeSubmissionRepository from "../../modules/PracticeSubmissions/Repository/PracticeSubmissionsRepository";
import CreatePracticeSubmission from "../../modules/PracticeSubmissions/Application/CreatePracticeSubmissionUseCase";
import GetPracticeSubmissionsUseCase from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionsUseCase";
import UpdatePracticeSubmission from "../../modules/PracticeSubmissions/Application/updatePracticeSubmissionUseCase";
import DeletePracticeSubmission from "../../modules/PracticeSubmissions/Application/DeletePracticeSubmissionUseCase";
import GetPracticeSubmissionByPracticeAndUserUseCase from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionByPracticeAndUserUseCase";
import GetPracticeSubmissionsByPracticeIdUseCase from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionsByPracticeIdUseCase";

class PracticeSubmissionController {
  private readonly createPracticeSubmissionUseCase: CreatePracticeSubmission;
  private readonly getPracticeSubmissionsUseCase: GetPracticeSubmissionsUseCase;
  private readonly updatePracticeSubmissionUseCase: UpdatePracticeSubmission;
  private readonly deletePracticeSubmissionUSeCase: DeletePracticeSubmission;
  private readonly getPracticeSubmissionUseCase: GetPracticeSubmissionByPracticeAndUserUseCase;
  private readonly getPracticeSubmissionsByPracticeIdUseCase: GetPracticeSubmissionsByPracticeIdUseCase;

  constructor(repository: PracticeSubmissionRepository) {
    this.createPracticeSubmissionUseCase = new CreatePracticeSubmission(repository);
    this.getPracticeSubmissionsUseCase = new GetPracticeSubmissionsUseCase(repository);
    this.getPracticeSubmissionUseCase = new GetPracticeSubmissionByPracticeAndUserUseCase(repository);
    this.updatePracticeSubmissionUseCase = new UpdatePracticeSubmission(repository);
    this.deletePracticeSubmissionUSeCase = new DeletePracticeSubmission(repository);
    this.getPracticeSubmissionsByPracticeIdUseCase =
      new GetPracticeSubmissionsByPracticeIdUseCase(repository);
  }

  async CreatePracticeSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { practiceid, userid, status, repository_link, start_date } =
        req.body;
      const newPracticeSubmission = await this.createPracticeSubmissionUseCase.execute({
        practiceid,
        userid,
        status,
        repository_link,
        start_date,
      });
      res.status(201).json(newPracticeSubmission);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getPracticeSubmissions(_req: Request, res: Response): Promise<void> {
    try {
      const practices = await this.getPracticeSubmissionsUseCase.execute();
      res.status(200).json(practices);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
  async getPracticeSubmissionByPracticeAndUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const practiceid = parseInt(req.params.practiceid);
      const userid = parseInt(req.params.userid);
      const practiceSubmission = await this.getPracticeSubmissionUseCase.execute(
        practiceid,
        userid
      );
      if (practiceSubmission) {
        res.status(200).json(practiceSubmission);
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Server error" });
    }
  }

  async updatePracticeSubmission(req: Request, res: Response): Promise<void> {
    try {
      const practiceSubmissionid = parseInt(req.params.id);
      const { status, end_date, comment, repository_link } = req.body;
      if (repository_link !== undefined) {
        const user = (req as Request & { user?: { id: number; role: string } }).user;
        if (user?.role !== "student") {
          res.status(403).json({ error: "Solo el estudiante puede editar su enlace." });
          return;
        }
        try {
          const saved = await this.updatePracticeSubmissionUseCase.finishWithRepositoryLink(
            practiceSubmissionid, user.id, { status, end_date, comment, repository_link }
          );
          if (!saved) {
            res.status(404).json({ error: "Entrega no encontrada o ya finalizada." });
            return;
          }
          res.status(200).json(saved);
        } catch (error) {
          if (error instanceof TypeError) {
            res.status(400).json({ error: error.message });
          } else {
            res.status(500).json({ error: "Server error" });
          }
        }
        return;
      }
      const updatedPracticeSubmission = await this.updatePracticeSubmissionUseCase.execute(
        practiceSubmissionid,
        {
          status,
          end_date,
          comment,
        }
      );
      if (updatedPracticeSubmission) {
        res.status(200).json(updatedPracticeSubmission);
      } else {
        res.status(404).json({ error: "Practice Submission not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateRepositoryLink(req: Request, res: Response): Promise<void> {
    const user = (req as Request & { user?: { id: number; role: string } }).user;
    if (user?.role !== "student") {
      res.status(403).json({ error: "Solo el estudiante puede editar su enlace." });
      return;
    }
    try {
      const saved = await this.updatePracticeSubmissionUseCase.updateRepositoryLink(
        Number(req.params.id), user.id, req.body.repository_link
      );
      if (!saved) {
        res.status(404).json({ error: "Entrega no encontrada o ya finalizada." });
        return;
      }
      res.status(200).json(saved);
    } catch (error) {
      if (error instanceof TypeError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  }

  async deletePracticeSubmission(req: Request, res: Response): Promise<void> {
    try {
      const practiceSubmissionid = parseInt(req.params.id);
      await this.deletePracticeSubmissionUSeCase.execute(practiceSubmissionid);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getPracticeSubmissionsByPracticeId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const practiceid = parseInt(req.params.practiceid, 10);
      const practices =
        await this.getPracticeSubmissionsByPracticeIdUseCase.execute(practiceid);
      res.status(200).json(practices);
    } catch (error) {
      res.status(500).json({ error: "Error getSubmissionsByPracticeId" });
    }
  }
}

export default PracticeSubmissionController;
