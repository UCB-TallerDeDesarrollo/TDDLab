import { GetAssignmentDetail } from "../../../../src/modules/Assignments/application/GetAssignmentDetail";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let getAssignmentDetail: GetAssignmentDetail;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  getAssignmentDetail = new GetAssignmentDetail(mockRepository);
});

describe("Get assignment detail", () => {
  it("Should successfully obtain assignment detail", async () => {
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
    const obtainedAssignment =
      await getAssignmentDetail.obtainAssignmentDetail(assignmentId);
    expect(obtainedAssignment).toEqual(assignment);
  });

  it("Should handle an exception if the assignment is not found", async () => {
    const obtainedAssignment =
      await getAssignmentDetail.obtainAssignmentDetail(2);
    expect(obtainedAssignment).toBeNull();
  });

  it("Should handle an exception if an error occurs", async () => {
    mockRepository.getAssignmentById.mockRejectedValue(
      new Error("Error simulado")
    );
    await expect(getAssignmentDetail.obtainAssignmentDetail(1)).rejects.toThrow(
      "Error simulado"
    );
  });
});
