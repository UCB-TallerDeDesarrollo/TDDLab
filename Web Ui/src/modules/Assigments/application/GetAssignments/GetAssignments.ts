import { fetchAssignments } from "../../repositories/assignment.API";

export class GetAssignments {
  constructor(assignmentsRepository) {
    this.assignmentsRepository = assignmentsRepository;
  }

  obtainAllAssignments() {
    return await assignmentsRepository.getAssignments();
  }
}
