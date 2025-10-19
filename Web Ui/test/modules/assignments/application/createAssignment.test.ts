import { CreateAssignments } from "../../../../src/modules/Assignments/application/CreateAssingment";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let createAssignment: CreateAssignments;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  createAssignment = new CreateAssignments(mockRepository);
});
describe("Create Assignment", () => {
  it("Should successfully create a new assignment", async () => {
    const assignmentId = 1;
    const assignment: AssignmentDataObject = {
      id: assignmentId,
      title: "Tarea Test",
      description: "Esta es una tarea de prueba",
      start_date: new Date("2023-10-31"),
      end_date: new Date("2023-11-05"),
      state: "inProgress",
      link: "Enlace",
      comment: null,
      groupid: 3,
    };
    mockRepository.createAssignment(assignment);
    await createAssignment.createAssignment(assignment);
    const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(assignment);
  });
});
