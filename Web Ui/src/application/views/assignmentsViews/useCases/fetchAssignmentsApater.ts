import { fetchAssignments } from "../../../../modules/Assignments/repository/assignment.API";

export const fetchAssignmentsUseCase = async () => {
  return await fetchAssignments();
}