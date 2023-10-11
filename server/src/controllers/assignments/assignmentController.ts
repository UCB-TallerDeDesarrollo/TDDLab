import { Request, Response } from "express";
import AssignmentPostgresAdapter from "../../modules/Assignments/repositories/assignmentsPostgressAdapter";
import { AssignmentDataObject } from "../../modules/Assignments/domain/Assignment"; // Adjust the import path based on your project structure

class AssignmentController {
  private assignmentAdapter: AssignmentPostgresAdapter;

  constructor() {
    this.assignmentAdapter = new AssignmentPostgresAdapter();
  }

  async getAssignments(_req: Request, res: Response): Promise<void> {
    try {
      const assignments = await this.assignmentAdapter.obtainAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const assignment = await this.assignmentAdapter.obtainAssignmentById(
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
      const { title, description, state, start_date, end_date } = req.body;
      const assignment: Omit<AssignmentDataObject, "id"> = {
        title,
        description,
        start_date,
        end_date,
        state,
      };
      const newAssignment = await this.assignmentAdapter.createAssignment(
        assignment
      );
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error("Error adding assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      await this.assignmentAdapter.deleteAssignment(assignmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentId = parseInt(req.params.id); // Parse the ID from the request params
      const { title, description, state, start_date, end_date } = req.body;

      const updatedAssignment: AssignmentDataObject = {
        title,
        description,
        start_date,
        end_date,
        state,
      };

      const updatedAssignmentResult =
        await this.assignmentAdapter.updateAssignment(
          assignmentId,
          updatedAssignment
        );

      if (updatedAssignmentResult) {
        res.status(200).json(updatedAssignmentResult);
      } else {
        res.status(404).json({ error: "Assignment not found" });
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default AssignmentController;
