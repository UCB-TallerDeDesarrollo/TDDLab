import { Request, Response } from "express";
import CreatePracticeUseCase from "../../modules/Practices/application/PracticeUseCases/createPracticeUseCase";
import DeletePracticeUseCase from "../../modules/Practices/application/PracticeUseCases/deletePracticeUseCase";
import GetPracticesUseCase from "../../modules/Practices/application/PracticeUseCases/getPracticesUseCase";
import GetPracticesByIdUseCase from "../../modules/Practices/application/PracticeUseCases/getPracticeByIdUseCase";
import GetPracticesByUserIdUseCase from "../../modules/Practices/application/PracticeUseCases/getPracticesByUserIdUseCase";
import UpdatePracticeUseCase from "../../modules/Practices/application/PracticeUseCases/updatePracticeUseCase";
import PracticeRepository from "../../modules/Practices/repository/PracticeRepository";

class PracticesController {
  private readonly createPracticeUseCase: CreatePracticeUseCase;
  private readonly deletePracticeUseCase: DeletePracticeUseCase;
  private readonly updatePracticeUseCase: UpdatePracticeUseCase;
  private readonly getPracticesUseCase: GetPracticesUseCase;
  private readonly getPracticeByIdUseCase: GetPracticesByIdUseCase;
  private readonly getPracticesByUserIdUseCase: GetPracticesByUserIdUseCase;

  constructor(repository: PracticeRepository) {
    this.createPracticeUseCase = new CreatePracticeUseCase(repository);
    this.deletePracticeUseCase = new DeletePracticeUseCase(repository);
    this.getPracticeByIdUseCase = new GetPracticesByIdUseCase(repository);
    this.getPracticesByUserIdUseCase = new GetPracticesByUserIdUseCase(repository);
    this.getPracticesUseCase = new GetPracticesUseCase(repository);
    this.updatePracticeUseCase = new UpdatePracticeUseCase(repository);
  }

  async getPractices(_req: Request, res: Response): Promise<void> {
    try {
      const practices = await this.getPracticesUseCase.execute();
      res.status(200).json(practices);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getPracticesById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const practice = await this.getPracticeByIdUseCase.execute(id);
      res.status(200).json(practice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getPracticesByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userid = req.params.userid;
      const practices = await this.getPracticesByUserIdUseCase.execute(userid);
      res.status(200).json(practices);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createPractice(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, creation_date, state, userid } = req.body;
      const newPractice = await this.createPracticeUseCase.execute({
        title,
        description,
        creation_date,
        state,
        userid,
      });
      res.status(201).json(newPractice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async deletePractice(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      await this.deletePracticeUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updatePractice(req: Request, res: Response): Promise<void> {
    try {
      const practiceId = req.params.id;
      const { title, description, state, creation_date, userid } = req.body;
      const updatedPractice = await this.updatePracticeUseCase.execute(
        practiceId,
        {
          title,
          description,
          state,
          creation_date,
          userid,
        }
      );

      if (updatedPractice) {
        res.status(200).json(updatedPractice);
      } else {
        res.status(404).json({ error: "Practice not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default PracticesController;
