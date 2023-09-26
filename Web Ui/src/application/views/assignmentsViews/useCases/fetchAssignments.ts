import { fetchAssignments } from "../../../../repositories/assignment.API";

export const fetchAssignmentsUseCase = async () => {
  return await fetchAssignments();
}