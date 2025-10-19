import AssignmentsRepositoryInterface from "../../../../src/modules/Assignments/domain/AssignmentsRepositoryInterface";
import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";

export class MockAssignmentsRepository implements AssignmentsRepositoryInterface {
  private assignments: AssignmentDataObject[] = [];

  getAssignments = jest.fn(async () => {
    return this.assignments;
  });

  getAssignmentById = jest.fn(async (assignmentId: number) => {
    const foundAssignment = this.assignments.find((assignment) => assignment.id === assignmentId);
    return foundAssignment ? { ...foundAssignment } : null;
  });

  getAssignmentsByGroupid = jest.fn(async (groupId: number) => {
    return this.assignments.filter(assignment => assignment.groupid === groupId);
  });

  createAssignment = jest.fn(async (assignmentData: AssignmentDataObject) => {
    this.assignments.push(assignmentData);
  });

  updateAssignment = jest.fn(async (assignmentId: number, assignmentData: AssignmentDataObject) => {
    const assignmentIndex = this.assignments.findIndex((assignment) => assignment.id === assignmentId);
    if (assignmentIndex !== -1) {
      this.assignments[assignmentIndex] = assignmentData;
    }
  });
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