import { useState, useEffect } from "react";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

import { groupsService } from "../services";
import { Group } from "../types";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const useGroupsData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [authData, setAuthData] = useGlobalState("authData");
  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  // 🔹 Sync selección
  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;

    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));

    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  // 🔹 Fetch con service
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const role = authData?.userRole ?? "";
        const uid = authData?.userid ?? -1;

        if (role === "teacher") {
          const data = await groupsService.getByUser(uid);
          setGroups(data);
        } else {
          const data = await groupsService.getAll();
          setGroups(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchGroups();
  }, [authData?.userRole, authData?.userid]);

  // 🔹 Selección inicial
  useEffect(() => {
    if (!groups.length || currentSelectedGroupId) return;

    const fromURL = asId(new URLSearchParams(window.location.search).get("groupId"));
    if (fromURL) return selectAndSync(fromURL);

    const fromLS = asId(localStorage.getItem("selectedGroup"));
    if (fromLS) return selectAndSync(fromLS);

    const fromAuth = asId(authData?.usergroupid);
    if (fromAuth) return selectAndSync(fromAuth);

    const firstVisible = asId(groups[0]?.id);
    if (firstVisible) selectAndSync(firstVisible);
  }, [groups, currentSelectedGroupId, authData?.usergroupid]);

  // 🔹 Sorting (adaptado a nuevo tipo)
  const handleGroupsOrder = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);

    const sortings = {
      A_Up_Order: () =>
        [...groups].sort((a, b) => a.name.localeCompare(b.name)),

      A_Down_Order: () =>
        [...groups].sort((a, b) => b.name.localeCompare(a.name)),

      Time_Up: () =>
        [...groups].sort(
          (a, b) =>
            new Date(b.creationDate ?? 0).getTime() -
            new Date(a.creationDate ?? 0).getTime()
        ),

      Time_Down: () =>
        [...groups].sort(
          (a, b) =>
            new Date(a.creationDate ?? 0).getTime() -
            new Date(b.creationDate ?? 0).getTime()
        ),
    } as const;

    const key = event.target.value as keyof typeof sortings;
    setGroups(sortings[key]());
  };

  // 🔹 Delete usando service
  const deleteGroupItem = async (groupIndex: number) => {
    const item = groups[groupIndex];
    if (!item) return;

    await groupsService.delete(item.id);

    const copy = [...groups];
    copy.splice(groupIndex, 1);
    setGroups(copy);

    if (asId(currentSelectedGroupId) === asId(item.id)) {
      const next = asId(copy[0]?.id);

      if (next) selectAndSync(next);
      else {
        setCurrentSelectedGroupId(0);
        localStorage.removeItem("selectedGroup");
        setAuthData({ ...authData, usergroupid: 0 });
      }
    }
  };

  // 🔹 Create (adaptado a nuevo tipo)
  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
    selectAndSync(newGroup.id);
  };

  // 🔹 Update (adaptado)
  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
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