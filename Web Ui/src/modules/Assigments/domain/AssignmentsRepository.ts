//import { CommitDataObject } from "./githubCommitInterfaces";

export interface AssignmentsRepository {
  createAssignment(assignmentData: AssignmentDataObject): Promise<void>;

  fetchAssignments();

  fetchAssignmentById(
    assignmentId: number
  ): Promise<AssignmentDataObject | null>;

  createAssignment(assignmentData: AssignmentDataObject): Promise<void>;

  update();

  delete();
}
