import { AssignmentDataObject } from "../../../../modules/Assignments/domain/assignmentInterfaces";
import { createAssignment } from "../../../../repositories/assignment.API";

export const createAssignmentsUseCase = async (assignmentData: AssignmentDataObject) => {
    return await createAssignment(assignmentData);
  }