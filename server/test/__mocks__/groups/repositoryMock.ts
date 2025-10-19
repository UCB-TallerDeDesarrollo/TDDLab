export function getGroupsRepositoryMock() {
  return {
    createGroup: jest.fn(),
    executeQuery: jest.fn(),
    mapRowToGroup: jest.fn(),
    obtainGroups: jest.fn(),
    obtainGroupById: jest.fn(),
    deleteGroup: jest.fn(),
    updateGroup: jest.fn(),
    checkGroupExists:jest.fn(),
  };
}