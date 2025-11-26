import { Request, Response } from "express";
import CreateAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/createAssignmentUseCase";
import DeleteAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase";
import GetAssignmentByIdUseCase from "../../modules/Assignments/application/AssignmentUseCases/getAssignmentByIdUseCase";
import GetAssignmentsUseCase from "../../modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import UpdateAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/updateAssignmentUseCase";
import AssignmentRepository from "../../modules/Assignments/repositories/AssignmentRepository";
import DeliverAssignmentUseCase from "../../modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
import GetAssignmentsByGroupIdUseCase from "../../modules/Assignments/application/AssignmentUseCases/getAssignmentsByGroupIdUseCase";

class AssignmentController {
  private readonly createAssignmentUseCase: CreateAssignmentUseCase;
  private readonly deleteAssignmentUseCase: DeleteAssignmentUseCase;
  private readonly getAssignmentByIdUseCase: GetAssignmentByIdUseCase;
  private readonly getAssignmentsByGroupIdUseCase: GetAssignmentsByGroupIdUseCase;
  private readonly getAssignmentsUseCase: GetAssignmentsUseCase;
  private readonly updateAssignmentUseCase: UpdateAssignmentUseCase;
  private readonly deliverAssignmentUseCase: DeliverAssignmentUseCase;

  constructor(repository: AssignmentRepository) {
    this.createAssignmentUseCase = new CreateAssignmentUseCase(repository);
    this.deleteAssignmentUseCase = new DeleteAssignmentUseCase(repository);
    this.getAssignmentByIdUseCase = new GetAssignmentByIdUseCase(repository);
    this.getAssignmentsByGroupIdUseCase = new GetAssignmentsByGroupIdUseCase(
      repository
    );
    this.getAssignmentsUseCase = new GetAssignmentsUseCase(repository);
    this.updateAssignmentUseCase = new UpdateAssignmentUseCase(repository);
    this.deliverAssignmentUseCase = new DeliverAssignmentUseCase(repository);
  }

  async getAssignments(_req: Request, res: Response): Promise<void> {
    try {
      const assignments = await this.getAssignmentsUseCase.execute();
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getAssignmentsByGroupId(req: Request, res: Response): Promise<void> {
    try {
      const groupid = parseInt(req.params.groupid, 10); // Extract group ID from request parameters
      const assignments = await this.getAssignmentsByGroupIdUseCase.execute(
        groupid
      );
      res.status(200).json(assignments);
    } catch (error) {
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
        res.status(404).json({ error: "Assignments not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

async createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      state,
      start_date,
      end_date,
      link,
      comment,
      groupid: rawGroupId,
    } = req.body;

    // Normalizar groupid (acepta number, string, array, o literales con {}[])
    let groupid: number;
    if (Array.isArray(rawGroupId)) {
      // si viene ["100"] o [{...}]
      groupid = Number(rawGroupId[0]);
    } else if (typeof rawGroupId === "string") {
      // quitar llaves, corchetes y comillas si vienen: '{"100"}' o '{100}'
      const cleaned = rawGroupId.replace(/[\[\]\{\}"]/g, "");
      groupid = Number(cleaned);
    } else {
      groupid = Number(rawGroupId);
    }

    if (!Number.isFinite(groupid) || Number.isNaN(groupid)) {
      console.warn("createAssignment: invalid groupid received:", rawGroupId);
      res.status(400).json({ error: "Invalid groupid" });
      return;
    }

    // DEBUG: ver qué llega antes de llamar al use case
    console.log("createAssignment payload:", {
      title,
      groupid,
      rawGroupId,
      typeof_rawGroupId: typeof rawGroupId,
    });

    const newAssignment = await this.createAssignmentUseCase.execute({
      title,
      description,
      state,
      start_date,
      end_date,
      link,
      comment,
      groupid,
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Ya existe una tarea con el mismo nombre en este grupo") {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes("Limite de caracteres excedido")) {
        res.status(400).json({
          error: error.message,
          message: `El titulo no puede tener mas de 50 caracteres.`,
        });
      } else {
        console.error("Unexpected error: ", error);
        res.status(500).json({ error: "Server error" });
      }
    } else {
      console.error("Unexpected error: ", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}



 async deleteAssignment(req: any, res: Response): Promise<void> {
    try {
      const assignmentId = parseInt(req.params.id, 10);

      console.log('=== INICIANDO ELIMINACIÓN ===');
      console.log('Assignment ID:', assignmentId);
      console.log('Tipo de ID:', typeof assignmentId);
      console.log('URL completa:', req.url);

      console.log('Intentando eliminar assignment ID:', assignmentId);

      if (!assignmentId) {
        res.status(400).json({
          success: false,
          error: 'ID de tarea es requerido'
        });
        return;
      }

      const existingAssignment = await this.getAssignmentByIdUseCase.execute(String(assignmentId));

      if (!existingAssignment) {
        res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
        return;
      }

      await this.deleteAssignmentUseCase.execute(String(assignmentId));

      res.status(200).json({
        success: true,
        message: 'Tarea eliminada correctamente'
      });

    } catch (error: any) {
      console.error('Error eliminando assignment:', error);
      console.error('=== ERROR EN ELIMINACIÓN ===');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('Código PostgreSQL:', error.code);

      if (error.message === "Tarea no encontrada") {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else if (error.message === "ID de tarea invalido") {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor al eliminar la tarea',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }


  async deliverAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const { link, comment } = req.body; // Extract comment from the request body

      const deliveredAssignment = await this.deliverAssignmentUseCase.execute(
        assignmentId,
        link,
        comment
      );

      if (deliveredAssignment) {
        res.status(200).json(deliveredAssignment);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const {
        title,
        description,
        state,
        start_date,
        end_date,
        link,
        comment,
        groupid,
      } = req.body;
      const updatedAssignment = await this.updateAssignmentUseCase.execute(
        assignmentId,
        {
          title,
          description,
          state,
          start_date,
          end_date,
          link,
          comment,
          groupid,
        }
      );

      if (updatedAssignment) {
        res.status(200).json(updatedAssignment);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Ya existe una tarea con el mismo nombre en este grupo") {
        res.status(400).json({ error: error.message });
      } else
        if (error.message.includes("Limite de caracteres excedido")) {
          res.status(400).json({
            error: error.message,
            message: `El titulo no puede tener mas de 50 caracteres.`,
          });
        } else if (error.message === "Assignment not found") {
        res.status(404).json({ error: error.message });
        }else {
          console.error("Unexpected error: ", error);
          res.status(500).json({ error: "Server error" });
        }
      } else {
        console.error("Unexpected error: ", error);
        res.status(500).json({ error: "Server error" });
      }
    }
  }
}

export default AssignmentController;