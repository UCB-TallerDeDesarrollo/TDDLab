import { AssignmentDataObject } from '../domain/assignmentInterfaces';

interface AssignmentsRepositoryInterface {
  fetchAssignments(): Promise<AssignmentDataObject[]>;
  fetchAssignmentById(assignmentId: number): Promise<AssignmentDataObject | null>;
  createAssignment(assignmentData: AssignmentDataObject): Promise<void>;
  updateAssignment(assignmentId: number, assignmentData: AssignmentDataObject): Promise<void>;
  deleteAssignment(assignmentId: number): Promise<void>;
}

export default AssignmentsRepositoryInterface;
