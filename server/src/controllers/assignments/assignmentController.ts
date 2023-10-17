import { Request, Response } from "express";
import CreateAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/createAssignmentUseCase";
import DeleteAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase";
import GetAssignmentByIdUseCase from "../../modules/Assignments/application/AssignmentUseCases/getAssignmentByIdUseCase";
import GetAssignmentsUseCase from "../../modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import UpdateAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/updateAssignmentUseCase";
import AssignmentRepository from "../../modules/Assignments/repositories/AssignmentRepository";
import DeliverAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
class AssignmentsController {
  private createAssignmentUseCase: CreateAssignmentUseCase;
  private deleteAssignmentUseCase: DeleteAssignmentUseCase;
  private getAssignmentByIdUseCase: GetAssignmentByIdUseCase;
  private getAssignmentsUseCase: GetAssignmentsUseCase;
  private updateAssignmentUseCase: UpdateAssignmentUseCase;
  private deliverAssignmentUseCase: DeliverAssignmentUseCase;

  constructor(repository: AssignmentRepository) {
    this.createAssignmentUseCase = new CreateAssignmentUseCase(repository);
    this.deleteAssignmentUseCase = new DeleteAssignmentUseCase(repository);
    this.getAssignmentByIdUseCase = new GetAssignmentByIdUseCase(repository);
    this.getAssignmentsUseCase = new GetAssignmentsUseCase(repository);
    this.updateAssignmentUseCase = new UpdateAssignmentUseCase(repository);
    this.deliverAssignmentUseCase = new DeliverAssignmentUseCase(repository);
  }

  async getAssignments(_req: Request, res: Response): Promise<void> {
    try {
      const assignments = await this.getAssignmentsUseCase.execute();
      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const assignment = await this.getAssignmentByIdUseCase.execute(
        assignmentId
      );
      if (assignment) {
        res.status(200).json(assignment);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, state, start_date, end_date, link } =
        req.body;
      const newAssignment = await this.createAssignmentUseCase.execute({
        title,
        description,
        state,
        start_date,
        end_date,
        link,
      });
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error("Error adding assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      await this.deleteAssignmentUseCase.execute(assignmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async deliverAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const { link } = req.body;

      const deliveredAssignment = await this.deliverAssignmentUseCase.execute(
        assignmentId,
        link
      );

      if (deliveredAssignment) {
        res.status(200).json(deliveredAssignment);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      console.error("Error delivering assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const { title, description, state, start_date, end_date, link } =
        req.body;
      const updatedAssignment = await this.updateAssignmentUseCase.execute(
        assignmentId,
        {
          title,
          description,
          state,
          start_date,
          end_date,
          link,
        }
      );

      if (updatedAssignment) {
        res.status(200).json(updatedAssignment);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default AssignmentsController;
