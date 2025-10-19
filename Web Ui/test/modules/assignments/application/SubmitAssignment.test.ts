import { SubmitAssignment } from "../../../../src/modules/Assignments/application/SubmitAssignment";
import {
  assignmentInProgresDataMock,
  assignmentPendingDataMock,
} from "../../__mocks__/assignments/data/assigmentDataMock";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let submitAssignment: SubmitAssignment;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  submitAssignment = new SubmitAssignment(mockRepository);
});

describe("Submit assignment", () => {
  it("Should successfully submit an assignment pending", async () => {
    mockRepository.createAssignment(assignmentPendingDataMock);
    await submitAssignment.submitAssignment(1, "", "comentario1");
    const updatedAssignment = await mockRepository.getAssignmentById(1);
    expect(updatedAssignment?.state).toBe("in progress");
    expect(updatedAssignment?.link).toBe("");
    expect(updatedAssignment?.comment).toBe("Comentario");
  });
  it("Should successfully submit an assignment in progress", async () => {
    const link = "https://example.com";
    mockRepository.createAssignment(assignmentInProgresDataMock);
    await submitAssignment.submitAssignment(2, link, "comentario2");
    const updatedAssignment = await mockRepository.getAssignmentById(2);
    expect(updatedAssignment?.state).toBe("delivered");
    expect(updatedAssignment?.link).toBe("https://example.com");
    expect(updatedAssignment?.comment).toBe("comentario2");
  });
  it("Should handle an exception if the assignment is not found", async () => {
    const link = "https://example.com";
    await expect(
      submitAssignment.submitAssignment(2, link, "comentario3")
    ).rejects.toThrow("No se encontró la tarea");
  });
});
