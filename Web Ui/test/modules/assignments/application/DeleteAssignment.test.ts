import { DeleteAssignment } from "../../../../src/modules/Assignments/application/DeleteAssignment";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let deleteAssignment: DeleteAssignment;
beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  deleteAssignment = new DeleteAssignment(mockRepository);
});
describe("Delete Assignment", () => {
  it("Should successfully delete an assignment", async () => {
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
    const obtainedAssignment = await deleteAssignment.deleteAssignment(1);
    expect(obtainedAssignment).toEqual("Succesful deletion");
  });
  it("Should handle an exception if an error occurs", async () => {
    mockRepository.deleteAssignment.mockRejectedValue(
      new Error("Error simulado")
    );
    await expect(deleteAssignment.deleteAssignment(1)).rejects.toThrow(
      "Error simulado"
    );
  });
});
