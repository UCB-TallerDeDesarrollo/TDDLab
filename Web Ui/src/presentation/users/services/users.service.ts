import GetUsers from "../../../modules/Users/application/getUsers";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { RemoveUserFromGroup } from "../../../modules/Users/application/removeUserFromGroup";
import { SearchUsersByEmail } from "../../../modules/Users/application/SearchUsersByEmail";
import GetUsersByGroupId from "../../../modules/Users/application/getUsersByGroupid";

import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GetGroupDetail } from "../../../modules/Groups/application/GetGroupDetail";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";

// ------------------- INSTANCIAS BASE -------------------

const userRepository = new UsersRepository();
const groupsRepository = new GroupsRepository();

// ------------------- USERS -------------------

export const getUsersService = async () => {
  const getUsers = new GetUsers(userRepository);
  return await getUsers.getUsers();
};

export const removeUserFromGroupService = async (userId: number) => {
  const removeUser = new RemoveUserFromGroup(userRepository);
  return await removeUser.removeUserFromGroup(userId);
};

export const searchUsersByEmailService = async (
  query: string,
  groupId: number | "all"
) => {
  const search = new SearchUsersByEmail(userRepository);
  return await search.execute({ query, groupId });
};

export const getUsersByGroupIdService = async (groupId: number) => {
  const getUsersByGroup = new GetUsersByGroupId(userRepository);
  return await getUsersByGroup.execute(groupId);
};

// ------------------- GROUPS -------------------

export const getGroupsService = async () => {
  const getGroups = new GetGroups(groupsRepository);
  return await getGroups.getGroups();
};

export const getGroupDetailService = async (groupId: number) => {
  const getGroupDetail = new GetGroupDetail(groupsRepository);
  return await getGroupDetail.obtainGroupDetail(groupId);
};