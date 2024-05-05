import { AssignmentDataObject } from "./assignmentInterfaces";

interface AssignmentsRepositoryInterface {
  getAssignments(): Promise<AssignmentDataObject[]>;
  getAssignmentById(assignmentId: number): Promise<AssignmentDataObject | null>;
  createAssignment(assignmentData: AssignmentDataObject): Promise<void>;
  updateAssignment(
    assignmentId: number,
    assignmentData: AssignmentDataObject,
  ): Promise<void>;
  deleteAssignment(assignmentId: number): Promise<void>;
  deliverAssignment(
    assignmentId: number,
    assignmentData: AssignmentDataObject,
  ): Promise<void>;
  getAssignmentsByGroupid(groupid: number): Promise<AssignmentDataObject[]>;
}

export default AssignmentsRepositoryInterface;
