import { AssignmentDataObject, AssignmentCreationObject } from "./Assignment";

export interface IAssignmentRepository {
  checkDuplicateTitle(title: string, groupid: number): Promise<boolean>;
  obtainAssignments(): Promise<AssignmentDataObject[]>;
  obtainAssignmentsByGroupId(groupid: number): Promise<AssignmentDataObject[]>;
  obtainAssignmentById(id: string): Promise<AssignmentDataObject | null>;
  obtainAssignmentsByPracticeId(practiceId: string): Promise<AssignmentDataObject[]>;
  createAssignment(assignment: AssignmentCreationObject): Promise<AssignmentCreationObject>;
  deleteAssignment(assignmentId: number): Promise<void>;
  deleteAssignmentsByPracticeId(practiceId: string): Promise<void>;
  updateAssignment(id: string, updatedAssignment: AssignmentCreationObject): Promise<AssignmentCreationObject | null>;
  groupidExistsForAssigment(groupid: number): Promise<boolean>;
}
