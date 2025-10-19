import { UpdateAssignment } from "../../../../src/modules/Assignments/application/UpdateAssignment";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/assignments/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let updateAssignment: UpdateAssignment;

beforeEach(() => {
  mockRepository = new MockAssignmentsRepository();
  updateAssignment = new UpdateAssignment(mockRepository);
});

describe("Update an assignment", () => {
  const assignmentId = 1;
  const baseAssignment: AssignmentDataObject = {
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

  const createAndExpectUpdatedAssignment = async (
    update: Partial<AssignmentDataObject>
  ) => {
    mockRepository.createAssignment(baseAssignment);
    await updateAssignment.updateAssignment(assignmentId, {
      ...baseAssignment,
      ...update,
    });
    const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual({ ...baseAssignment, ...update });
  };

  it("Should successfully update an assignment title", async () => {
    await createAndExpectUpdatedAssignment({ title: "Tarea 2" });
  });

  it("Should successfully update an assignment description", async () => {
    await createAndExpectUpdatedAssignment({
      description: "Esta descripción está actualizada",
    });
  });

  it("Should successfully update an assignment start date", async () => {
    await createAndExpectUpdatedAssignment({
      start_date: new Date("2023-01-02"),
    });
  });

  it("Should successfully update an assignment end date", async () => {
    await createAndExpectUpdatedAssignment({
      end_date: new Date("2023-01-09"),
    });
  });

  it("Should successfully update an assignment state", async () => {
    await createAndExpectUpdatedAssignment({ state: "Pending" });
  });

  it("Should successfully update an assignment link", async () => {
    await createAndExpectUpdatedAssignment({ link: "link" });
  });

  it("Should successfully update an assignment comment", async () => {
    await createAndExpectUpdatedAssignment({ comment: "nuevo comentario" });
  });
  it("Should handle error during assignment update", async () => {
    const errorMessage = "Update failed";
    mockRepository.updateAssignment = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));
    await expect(
      updateAssignment.updateAssignment(assignmentId, baseAssignment)
    ).rejects.toThrowError(errorMessage);
  });
  it("Should successfully update an assignment's group", async () => {
    await createAndExpectUpdatedAssignment({ groupid: 5 });
  });
});
