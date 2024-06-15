import { GetAssignmentsByGroupId } from "../../../../src/modules/Assignments/application/GetAssignmentsByGroupid";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let getAssignment: GetAssignmentsByGroupId;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  getAssignment = new GetAssignmentsByGroupId(mockRepository);
});

describe("Get assignments by group id", () => {
  it("Should successfully obtain assignments list for group id 67", async () => {
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
      groupid: 67,
    };
    mockRepository.createAssignment(assignment);
    const obtainedAssignments = await getAssignment.obtainAssignmentsByGroupId(67);
    console.log(obtainedAssignments);
    expect(obtainedAssignments).toEqual([assignment]);
  });

  it("Should return an empty array if no assignments found for group id 67", async () => {
    const obtainedAssignments = await getAssignment.obtainAssignmentsByGroupId(67);
    console.log(obtainedAssignments);
    expect(obtainedAssignments).toEqual([]);
  });
  it("Should handle error when fetching assignments by group id", async () => {
    jest.spyOn(mockRepository, 'getAssignmentsByGroupid').mockRejectedValue(new Error('Error fetching assignments'));
    await expect(getAssignment.obtainAssignmentsByGroupId(67)).rejects.toThrow('Error fetching assignments');
  });
});
