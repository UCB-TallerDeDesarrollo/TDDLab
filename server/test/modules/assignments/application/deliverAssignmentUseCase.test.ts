import DeliverAssignmentUseCase from "../../../../src/modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deliverAssignment: DeliverAssignmentUseCase;

beforeEach(() => {
  deliverAssignment = new DeliverAssignmentUseCase(assignmentRepositoryMock);
});

describe("Deliver assignment", () => {
  const generateTestData = (
    assignmentId: string,
    link: string,
    comment: string,
    groupid: number,
  ) => {
    return {
      assignmentId,
      link,
      comment,
      title: "Tarea en progreso",
      state: "delivered",
      id: "2",
      description: "Esta es una tarea en progreso",
      start_date: new Date("2023-01-01"),
      end_date: new Date("2023-01-10"),
      groupid,
    };
  };

  const executeTest = async (
    assignmentId: string,
    link: string,
    comment: string,
    // groupid: number
  ) => {
    return await deliverAssignment.execute(assignmentId, link, comment, );
  };

  it("should deliver an assignment successfully", async () => {
    const { assignmentId, link, comment, groupid, ...expectedData } = generateTestData(
      "id_assignment_in_progress",
      "Enlace de la tarea",
      "Comentario",
      1
    );
    const result = await executeTest(assignmentId, link, comment, );
    expect(result).toEqual(expect.objectContaining(expectedData));
  });

  it("should return null when the assignment does not exist", async () => {
    const { assignmentId, link, comment, } = generateTestData(
      "non_existing_id",
      "Enlace de la tarea",
      "no pude probar una funcionalidad", 
      0

    );
    const result = await executeTest(assignmentId, link, comment,) ;
    expect(result).toBeNull();
  });

  it("should handle errors during assignment delivery", async () => {
    assignmentRepositoryMock.obtainAssignmentById.mockRejectedValue(
      new Error()
    );
    await expect(
      executeTest("existing_id", "Enlace de la tarea", "")
    ).rejects.toThrowError();
  });
});
