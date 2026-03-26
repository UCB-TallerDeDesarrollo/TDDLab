// hooks/useAssignments.ts
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SelectChangeEvent } from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

interface UseAssignmentsParams {
  userRole: string;
  userGroupid: number | number[];
  onGroupChange: (groupId: number) => void;
}

export default function useAssignments({ userRole, userGroupid, onGroupChange }: UseAssignmentsParams) {
  const location = useLocation();
  const [authData, setAuthData] = useGlobalState("authData");

  const assignmentsRepository = useMemo(() => new AssignmentsRepository(), []);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssignmentsByGroupId = async (groupId: number) => {
    setSelectedGroup(groupId);
    onGroupChange(groupId);
    localStorage.setItem("selectedGroup", groupId.toString());

    const updatedAuthData = { ...authData, usergroupid: groupId };
    setAuthData(updatedAuthData);

    try {
      const data = updatedAuthData.usergroupid !== undefined
        ? await assignmentsRepository.getAssignmentsByGroupid(updatedAuthData.usergroupid)
        : await assignmentsRepository.getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments by group ID:", error);
    }
  };

  const getUserGroups = async (): Promise<GroupDataObject[]> => {
    let allGroups: GroupDataObject[] = [];

    if (userRole === "student") {
      if (localStorage.getItem("userGroups") === null) {
        localStorage.setItem("userGroups", JSON.stringify(userGroupid));
        const ids = Array.isArray(userGroupid) ? userGroupid : [userGroupid];
        allGroups = await Promise.all(ids.map((id) => getGroups.getGroupById(id)));
      } else if (localStorage.getItem("userGroups") === "[0]") {
        const ids = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem("userGroups", JSON.stringify(ids));
        allGroups = await Promise.all(ids.map((id) => getGroups.getGroupById(id)));
      } else {
        const ids: number[] = JSON.parse(localStorage.getItem("userGroups") ?? "[]");
        allGroups = await Promise.all(ids.map((id) => getGroups.getGroupById(id)));
      }
    } else if (userRole === "teacher") {
      const ids = await getGroups.getGroupsByUserId(authData.userid ?? -1);
      allGroups = await Promise.all(ids.map((id) => getGroups.getGroupById(id)));
    } else if (userRole === "admin") {
      allGroups = await getGroups.getGroups();
    }

    return allGroups;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      const groupIdUrl   = Number(new URLSearchParams(globalThis.location.search).get("groupId")) || null;
      const groupIdLocal = Number(localStorage.getItem("selectedGroup")) || null;
      const groupIdAuth  = authData?.usergroupid ?? null;

      let firstUserGroup: number | null = null;
      try {
        const stored = JSON.parse(localStorage.getItem("userGroups") || "[]");
        if (Array.isArray(stored) && stored.length > 0) firstUserGroup = stored[0];
      } catch {}

      const finalGroupId = groupIdUrl ?? groupIdLocal ?? groupIdAuth ?? firstUserGroup ?? allGroups[0]?.id ?? null;

      if (finalGroupId) {
        await loadAssignmentsByGroupId(finalGroupId);
      } else {
        setSelectedGroup(0);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error en fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location]);

  useEffect(() => {
    const handler = () => {
      const groupId = Number(localStorage.getItem("selectedGroup")) || selectedGroup;
      if (groupId) loadAssignmentsByGroupId(groupId);
    };
    globalThis.addEventListener("assignment-updated", handler as EventListener);
    return () => globalThis.removeEventListener("assignment-updated", handler as EventListener);
  }, [selectedGroup]);

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    await loadAssignmentsByGroupId(event.target.value as number);
  };

  return {
    assignments,
    setAssignments,
    groupList,
    selectedGroup,
    isLoading,
    loadAssignmentsByGroupId,
    handleGroupChange,
  };
}