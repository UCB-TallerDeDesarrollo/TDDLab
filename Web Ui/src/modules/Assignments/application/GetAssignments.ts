import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class GetAssignments {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async obtainAllAssignments() {
    return await this.assignmentsRepository.getAssignments();
  }
}
