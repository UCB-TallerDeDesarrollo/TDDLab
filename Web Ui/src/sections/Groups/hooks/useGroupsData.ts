import { useState, useEffect } from "react";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const useGroupsData = () => {
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [authData, setAuthData] = useGlobalState("authData");
  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  const groupRepository = new GroupsRepository();

  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;
    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));
    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroupsApp = new GetGroups(groupRepository);
      const role = authData?.userRole ?? "";
      const uid = authData?.userid ?? -1;

      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (
          await Promise.all(ids.map((id: number) => getGroupsApp.getGroupById(id)))
        ).filter(Boolean) as GroupDataObject[];
        setGroups(allGroups);
      } else {
        const allGroups = await getGroupsApp.getGroups();
        setGroups(allGroups);
      }
    };
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData?.userRole, authData?.userid]);

  useEffect(() => {
    if (!groups.length || currentSelectedGroupId) return;

    const fromURL = asId(new URLSearchParams(window.location.search).get("groupId"));
    if (fromURL) return selectAndSync(fromURL);

    const fromLS = asId(localStorage.getItem("selectedGroup"));
    if (fromLS) return selectAndSync(fromLS);

    const fromAuth = asId(authData?.usergroupid);
    if (fromAuth) return selectAndSync(fromAuth);

    (async () => {
      try {
        const getGroupsApp = new GetGroups(groupRepository);
        const uid = asId(authData?.userid);
        if (uid) {
          const ids = await getGroupsApp.getGroupsByUserId(uid);
          const first = asId(ids?.[0]);
          if (first) return selectAndSync(first);
        }
      } catch {
        /* ignore */
      }
      const firstVisible = asId(groups[0]?.id);
      if (firstVisible) selectAndSync(firstVisible);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, currentSelectedGroupId, authData?.usergroupid, authData?.userid]);

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    const sortings = {
      A_Up_Order: () =>
        [...groups].sort((a, b) => a.groupName.localeCompare(b.groupName)),
      A_Down_Order: () =>
        [...groups].sort((a, b) => b.groupName.localeCompare(a.groupName)),
      Time_Up: () =>
        [...groups].sort(
          (a, b) =>
            new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
        ),
      Time_Down: () =>
        [...groups].sort(
          (a, b) =>
            new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
        ),
    } as const;

    const key = event.target.value as keyof typeof sortings;
    setGroups(sortings[key]());
  };

  const deleteGroupItem = async (groupIndex: number) => {
    const itemFound = groups[groupIndex];
    if (itemFound) {
      const deleteGroupAction = new DeleteGroup(groupRepository);
      await deleteGroupAction.deleteGroup(asId(itemFound.id) || 0);

      const copy = [...groups];
      copy.splice(groupIndex, 1);
      setGroups(copy);

      if (asId(currentSelectedGroupId) === asId(itemFound.id)) {
        const next = asId(copy[0]?.id);
        if (next) selectAndSync(next);
        else {
          setCurrentSelectedGroupId(0);
          localStorage.removeItem("selectedGroup");
          setAuthData({ ...authData, usergroupid: 0 });
        }
      }
    }
  };

  const handleGroupCreated = (newGroup: GroupDataObject) => {
    setGroups((prev) => [newGroup, ...prev]);
    selectAndSync(newGroup.id);
  };

  const handleGroupUpdated = (updatedGroup: GroupDataObject) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  return {
    groups,
    currentSelectedGroupId,
    selectedSorting,
    selectAndSync,
    handleGroupsOrder,
    deleteGroupItem,
    handleGroupCreated,
    handleGroupUpdated,
  };
};
