import DeliverAssignmentUseCase from "../../../../src/modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deliverAssignment: DeliverAssignmentUseCase;

beforeEach(() => {
  deliverAssignment = new DeliverAssignmentUseCase(assignmentRepositoryMock);
});

describe("Deliver assignment", () => {
  it("Should deliver an assignment successfully", async () => {
    const assignmentId = 'id_assignment_pending';
    const link = 'Enlace de la tarea';
    const result = await deliverAssignment.execute(assignmentId, link);
    expect(result).toEqual(
      expect.objectContaining({
        title: "Tarea pendiente",
        link: "Enlace de la tarea",
        state: "in progress",
        id: "1",
        description: "Esta es una tarea pendiente",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        comment: "Comentario",
      })
    );
  });
  it("Should deliver an assignment successfully", async () => {
    const assignmentId = 'id_assignment_in_progress';
    const link = 'Enlace de la tarea';
    const result = await deliverAssignment.execute(assignmentId, link);
    expect(result).toEqual(
      expect.objectContaining({
        title: "Tarea en progreso",
        link: "Enlace de la tarea",
        state: "delivered",
        id: "2",
        description: "Esta es una tarea en progreso",
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

