import GetGroups from "../../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { mapToGroup } from "../types/groupMapper";
import { Group } from "../types/group";

const repo = new GroupsRepository();

export const groupsService = {
  async getAll(): Promise<Group[]> {
    const app = new GetGroups(repo);
    const data = await app.getGroups();
    return data.map(mapToGroup);
  },

  async getByUser(userId: number): Promise<Group[]> {
    const app = new GetGroups(repo);
    const ids = await app.getGroupsByUserId(userId);

    const groups = await Promise.all(
      ids.map((id: number) => app.getGroupById(id))
    );

    return groups.filter(Boolean).map(mapToGroup);
  },

  async delete(id: number): Promise<void> {
    const app = new DeleteGroup(repo);
    await app.deleteGroup(id);
  },
};