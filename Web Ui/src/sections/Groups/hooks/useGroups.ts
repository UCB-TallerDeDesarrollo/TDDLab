import { useState, useEffect, useMemo } from "react";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";

export type AuthData = {
  userid: number | undefined;
  userProfilePic: string | undefined;
  userEmail: string | undefined;
  usergroupid: number | undefined;
  userRole: string | undefined;
};

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};


function useGroups(authData: AuthData | undefined) {
  const groupRepository = useMemo(() => new GroupsRepository(), []);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroupsApp = new GetGroups(groupRepository);
      const role = authData?.userRole ?? "";
      const uid  = authData?.userid ?? -1;

      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (await Promise.all(ids.map((id: number) => getGroupsApp.getGroupById(id))))
          .filter(Boolean) as GroupDataObject[];
        setGroups(allGroups);
      } else {
        const allGroups = await getGroupsApp.getGroups();
        setGroups(allGroups);
      }
    };
    fetchGroups();
  }, [authData?.userRole, authData?.userid]);

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    const sortings = {
      A_Up_Order:  () => [...groups].sort((a, b) => a.groupName.localeCompare(b.groupName)),
      A_Down_Order: () => [...groups].sort((a, b) => b.groupName.localeCompare(a.groupName)),
      Time_Up:     () => [...groups].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()),
      Time_Down:   () => [...groups].sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()),
    } as const;
    const key = event.target.value as keyof typeof sortings;
    setGroups(sortings[key]());
  };

  const handleGroupUpdated = (updatedGroup: GroupDataObject) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  };

  return { groups, setGroups, groupRepository, selectedSorting, handleGroupsOrder, handleGroupUpdated };
}

export {useGroups, asId }