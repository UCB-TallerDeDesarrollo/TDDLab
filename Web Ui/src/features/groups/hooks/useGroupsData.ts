import { useState, useEffect } from "react";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

import { groupsService } from "../services";
import { Group } from "../types";

import { getCourseLink } from "../../../modules/Groups/application/GetCourseLink";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../../modules/Users/application/getUsersByGroupid";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const useGroupsData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [authData, setAuthData] = useGlobalState("authData");

  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  // ✅ nuevos estados QA
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔹 dependencias movidas aquí (NO en UI)
  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);

  // 🔹 Sync selección (fuente principal: hook)
  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;

    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));

    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  // 🔹 Fetch con estados
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(false);

      try {
        const role = authData?.userRole ?? "";
        const uid = authData?.userid ?? -1;

        let data: Group[] = [];

        if (role === "teacher") {
          data = await groupsService.getByUser(uid);
        } else {
          data = await groupsService.getAll();
        }

        setGroups(data);

        // selección inicial simple (fuente única)
        if (!currentSelectedGroupId && data.length > 0) {
          selectAndSync(data[0].id);
        }

      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [authData?.userRole, authData?.userid]);

  // 🔹 Sorting
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

  // 🔹 Delete
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

  // 🔹 acciones de negocio (movidas desde UI)
  const copyTeacherLink = (groupId: number) => {
    getCourseLink(groupId, "teacher");
  };

  const copyStudentLink = (groupId: number) => {
    getCourseLink(groupId, "student");
  };

  const goToParticipants = async (groupId: number, navigate: any) => {
    await getUsersByGroupId.execute(groupId);
    navigate(`/users/group/${groupId}`);
  };

  // 🔹 Create
  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
    selectAndSync(newGroup.id);
  };

  // 🔹 Update
  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  return {
    groups,
    loading,
    error,
    currentSelectedGroupId,
    selectedSorting,

    selectAndSync,
    handleGroupsOrder,
    deleteGroupItem,

    copyTeacherLink,
    copyStudentLink,
    goToParticipants,

    handleGroupCreated,
    handleGroupUpdated,
  };
};