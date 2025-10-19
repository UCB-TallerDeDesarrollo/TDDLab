import { mockUsers } from './dataTypeMocks/mockUsers';

export function getUserRepositoryMock(){
    return {
        getUsersByGroupid: jest.fn((groupId: number) => {
            const usersInGroup = mockUsers.filter((user) => user.groupid.includes(groupId));
            return Promise.resolve(usersInGroup);
          }),
    };
}