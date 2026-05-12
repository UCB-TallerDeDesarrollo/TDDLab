import { useState, useEffect } from "react";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

export function useGroups(open: boolean) {
  const [auth] = useGlobalState("authData");
  const [groups, setGroups] = useState<GroupDataObject[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchGroups = async () => {
      const groupRepository = new GroupsRepository();
      const getGroups = new GetGroups(groupRepository);
      let list: GroupDataObject[] = [];

      if (auth?.userRole === "teacher") {
        const ids = await getGroups.getGroupsByUserId(auth.userid ?? -1);
        list = (
          await Promise.all(ids.map((id: number) => getGroups.getGroupById(id)))
        ).filter(Boolean) as GroupDataObject[];
      } else if (auth?.userRole === "admin") {
        list = await getGroups.getGroups();
      } else if (auth?.userRole === "student") {
        let ids: number[] = [];
        try {
          const fromLS = JSON.parse(localStorage.getItem("userGroups") ?? "[]");
          if (Array.isArray(fromLS) && fromLS.length) ids = fromLS;
        } catch {}
        if (!ids.length) {
          ids = await getGroups.getGroupsByUserId(auth.userid ?? -1);
        }
        list = (
          await Promise.all(ids.map((id: number) => getGroups.getGroupById(id)))
        ).filter(Boolean) as GroupDataObject[];
      }

      setGroups(list);
      return list;
    };

    fetchGroups();
  }, [open, auth?.userRole, auth?.userid]);

  return { groups };
}