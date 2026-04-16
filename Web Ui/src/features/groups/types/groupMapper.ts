import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { Group } from "./group";

export const mapToGroup = (g: GroupDataObject): Group => ({
  id: Number(g.id),
  name: g.groupName,
  description: g.groupDetail,
  creationDate: g.creationDate,
});