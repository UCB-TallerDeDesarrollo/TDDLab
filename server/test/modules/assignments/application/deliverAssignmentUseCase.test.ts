import DeliverAssignmentUseCase from "../../../../src/modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deliverAssignment: DeliverAssignmentUseCase;

beforeEach(() => {
  deliverAssignment = new DeliverAssignmentUseCase(assignmentRepositoryMock);
});

describe("Deliver assignment", () => {
  it("Should deliver an assignment successfully", async () => {
    const assignmentId = 'existing_id';
    const link = 'Enlace de la tarea';
    const result = await deliverAssignment.execute(assignmentId, link);
    expect(result).toEqual(
      expect.objectContaining({
        title: "Tarea 1",
        link: "Enlace de la tarea",
        state: "in progress",
        id: "1",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        comment: "Comentario",
      })
    );
  });
  it('should return null when the assignment does not exist', async () => {
    const assignmentId = 'non_existing_id';
    const link = 'Enlace de la tarea';
    const result = await deliverAssignment.execute(assignmentId, link);
    expect(result).toBeNull();
  });
  it('should handle errors during assignment delivery', async () => {
    assignmentRepositoryMock.obtainAssignmentById.mockRejectedValue(new Error);
    await expect(deliverAssignment.execute('existing_id', 'Enlace de la tarea')).rejects.toThrowError();
  });
});

