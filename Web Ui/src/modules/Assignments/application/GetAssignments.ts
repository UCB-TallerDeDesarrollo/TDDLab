

import  AssignmentsRepositoryInterface  from "../domain/AssignmentsRepositoryInterface";

export class GetAssignments {
  constructor(private assignmentsRepository: AssignmentsRepositoryInterface) {}

  async obtainAllAssignments() {
    return await this.assignmentsRepository.getAssignments();
  }
}
