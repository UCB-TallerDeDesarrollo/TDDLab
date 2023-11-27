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
  it("Should successfully update an assignment title", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 2",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        state: "inProgress",
        link: "Enlace",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
  it("Should successfully update an assignment description", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 1",
        description: "Esta descripción está actualizada",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        state: "inProgress",
        link: "Enlace",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
  it("Should successfully update an assignment start date", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 1",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-02"),
        end_date: new Date("2023-01-10"),
        state: "inProgress",
        link: "Enlace",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
  it("Should successfully update an assignment end date", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 1",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-09"),
        state: "inProgress",
        link: "Enlace",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
  it("Should successfully update an assignment state", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 1",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        state: "Pending",
        link: "Enlace",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
  it("Should successfully update an assignment link", async () => {
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
    };
    const newAssignment: AssignmentDataObject = {
        id: 1,
        title: "Tarea 1",
        description: "Esta es la primera tarea",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-10"),
        state: "inProgress",
        link: "link",
        comment: "Comentario",
      };
    mockRepository.createAssignment(assignment);
      await updateAssignment.updateAssignment(assignmentId,newAssignment);
      const obtainedAssignment = await mockRepository.getAssignmentById(1);
    expect(obtainedAssignment).toEqual(newAssignment);
  });
});
