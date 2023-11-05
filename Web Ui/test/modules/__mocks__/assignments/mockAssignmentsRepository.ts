import AssignmentsRepositoryInterface from "../../../../src/modules/Assignments/domain/AssignmentsRepositoryInterface";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";

export class MockAssignmentsRepository implements AssignmentsRepositoryInterface {
  private assignments: AssignmentDataObject[] = [];

  getAssignments = jest.fn();

  getAssignmentById = jest.fn(async (assignmentId: number) => {
    const foundAssignment = this.assignments.find((assignment) => assignment.id === assignmentId);
    return foundAssignment ? { ...foundAssignment } : null;
  });

  createAssignment = jest.fn(async (assignmentData: AssignmentDataObject) => {
    this.assignments.push(assignmentData);
  });

  updateAssignment = jest.fn();
  deleteAssignment = jest.fn();

  deliverAssignment = jest.fn(async (assignmentId: number, assignmentData: AssignmentDataObject) => {
    const assignmentIndex = this.assignments.findIndex((assignment) => assignment.id === assignmentId);
    if (assignmentIndex !== -1) {
      this.assignments[assignmentIndex] = {
        ...this.assignments[assignmentIndex],
        ...assignmentData,
      };
    }
  });
}