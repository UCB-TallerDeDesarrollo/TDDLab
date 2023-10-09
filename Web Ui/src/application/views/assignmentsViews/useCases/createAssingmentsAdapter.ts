import { AssignmentDataObject } from "../../../../domain/models/assignmentInterfaces";
import { createAssignment } from "../../../../modules/Assigments/repositories/assignment.API";

export const createAssignmentsUseCase = async (
  assignmentData: AssignmentDataObject
) => {
  return await createAssignment(assignmentData);
};
