import DeleteGroupUseCase from '../../../../src/modules/Groups/application/GroupUseCases/deleteGroupUseCase';
import { getGroupsRepositoryMock } from '../../../__mocks__/groups/repositoryMock';
import { getDataGroupMock, getDataListOfGroupsMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';
import { getAssignmentListMock } from '../../../__mocks__/assignments/dataTypeMocks/assignmentData';
import { getAssignmentRepositoryMock } from '../../../__mocks__/assignments/repositoryMock';
import DeleteAssignment from '../../../../src/modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase';

const groupRepositoryMock = getGroupsRepositoryMock();
let deleteGroupUseCase: DeleteGroupUseCase;
const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deleteAssignment: DeleteAssignment;

beforeEach(() => {
  deleteGroupUseCase = new DeleteGroupUseCase(groupRepositoryMock);
  deleteAssignment = new DeleteAssignment(assignmentRepositoryMock);
});


describe('DeleteGroupUseCase', () => {
  it('should delete an existing group successfully', async () => {
    const groupid = 1;
    const existingGroup = getDataListOfGroupsMock.find(group => group.id === groupid);
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(existingGroup);
    await deleteGroupUseCase.execute(groupid);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupid);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupid);
  });

  it('should throw an error for non-existing group ID', async () => {
    const nonExistingGroupId = 0; //if theres no group, 0
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(null);
    await expect(deleteGroupUseCase.execute(nonExistingGroupId)).rejects.toThrowError(Error);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(nonExistingGroupId);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalled();
  });

  it('should handle errors during group deletion', async () => {
    const groupid = 3;
    const mockError = new Error("Deletion failed due to internal error");
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.deleteGroup.mockRejectedValueOnce(mockError);

    // Test the specific error throw and error message
    await expect(deleteGroupUseCase.execute(groupid)).rejects.toThrowError("Deletion failed due to internal error");

    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupid);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupid);

    // Verify no unnecessary methods were called
    expect(groupRepositoryMock.updateGroup).not.toHaveBeenCalled();
    expect(groupRepositoryMock.createGroup).not.toHaveBeenCalled();
  });

  it('should delete all related assignments when a group is deleted', async ()=>{
    const groupid = 1;
    const assignmentsToDelete = getAssignmentListMock().filter(assignment => assignment.groupid === groupid);

    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataListOfGroupsMock.find(group => group.id === groupid));
    assignmentRepositoryMock.obtainAssignmentsByGroupId.mockResolvedValueOnce(assignmentsToDelete)

    for (const assignment of assignmentsToDelete) {
      await deleteAssignment.execute(assignment.id);
    }
    await deleteGroupUseCase.execute(groupid);

    assignmentsToDelete.forEach(assignment => {
      expect(assignmentRepositoryMock.deleteAssignment).toHaveBeenCalledWith(assignment.id);
    });
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupid);
  });
});
