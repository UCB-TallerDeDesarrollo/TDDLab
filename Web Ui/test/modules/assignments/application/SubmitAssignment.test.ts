import { SubmitAssignment } from "../../../../src/modules/Assignments/application/SubmitAssignment";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let submitAssignment: SubmitAssignment;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  submitAssignment = new SubmitAssignment(mockRepository);
});

describe("Submit assignment", () => {
  it("Should successfully submit an assignment", async () => {
    const link = "https://example.com";
    const assignment: AssignmentDataObject = {
      id: 1,
      title: "Tarea 1",
      description: "Esta es la primera tarea",
      start_date: new Date("2023-01-01"),
      end_date: new Date("2023-01-10"),
      state: "pending",
      link: "Enlace",
    };
    mockRepository.createAssignment(assignment);
    await submitAssignment.submitAssignment(1, link);
    const updatedAssignment = await mockRepository.getAssignmentById(1);
    expect(updatedAssignment?.state).toBe("pending");
    expect(updatedAssignment?.link).toBe(link);
  });

  it("Should handle an exception if the assignment is not found", async () => {
    const link = "https://example.com";
    await expect(submitAssignment.submitAssignment(2, link)).rejects.toThrow(
      "No se encontró la tarea"
    );
  });
});
