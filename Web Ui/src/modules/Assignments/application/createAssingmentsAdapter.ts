import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import { createAssignment } from "../repository/assignment.API";

export const createAssignmentsUseCase = async (assignmentData: AssignmentDataObject) => {
    return await createAssignment(assignmentData);
  }