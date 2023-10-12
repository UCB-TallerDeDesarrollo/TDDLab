import { fetchAssignments } from "../repository/assignment.API";

export const fetchAssignmentsUseCase = async () => {
  return await fetchAssignments();
}