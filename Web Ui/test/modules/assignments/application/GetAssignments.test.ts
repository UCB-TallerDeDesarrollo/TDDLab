import { GetAssignments } from "../../../../src/modules/Assignments/application/GetAssignments";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let getAssignment: GetAssignments;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  getAssignment = new GetAssignments(mockRepository);
});

describe("Get assignments", () => {
  it("Should successfully obtain assignments list", async () => {
    const assignmentId = 1;
    const assignment: AssignmentDataObject = {
      id: assignmentId,
      title: "Tarea 1",
      description: "Esta es la primera tarea",
      start_date: new Date("2023-01-01"),
      end_date: new Date("2023-01-10"),
      state: "inProgress",
      link: "Enlace",
      comment: "Comentario",
      groupid: 3,
    };
    mockRepository.createAssignment(assignment);
    const obtainedAssignment = await getAssignment.obtainAllAssignments();
    console.log(obtainedAssignment);
    expect(obtainedAssignment).toEqual([assignment]);
  });
});
