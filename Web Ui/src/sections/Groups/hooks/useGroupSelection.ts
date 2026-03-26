import { useState, useEffect, useMemo } from "react";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { AuthData, asId } from "./useGroups";

function useGroupSelection(
  groups: GroupDataObject[],
  authData: AuthData | undefined,
  setAuthData: (value: AuthData) => void
) {
  const groupRepository = useMemo(() => new GroupsRepository(), []);
  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);

  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;
    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));
    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData!, usergroupid: id });
    }
  };

  const clearSelection = () => {
    setCurrentSelectedGroupId(0);
    localStorage.removeItem("selectedGroup");
    setAuthData({ ...authData!, usergroupid: 0 });
  };

  useEffect(() => {
    if (!groups.length || currentSelectedGroupId) return;

    const fromURL = asId(new URLSearchParams(window.location.search).get("groupId"));
    if (fromURL) { selectAndSync(fromURL); return; }

    const fromLS = asId(localStorage.getItem("selectedGroup"));
    if (fromLS) { selectAndSync(fromLS); return; }

    const fromAuth = asId(authData?.usergroupid);
    if (fromAuth) { selectAndSync(fromAuth); return; }

    (async () => {
      try {
        const getGroupsApp = new GetGroups(groupRepository);
        const uid = asId(authData?.userid);
        if (uid) {
          const ids = await getGroupsApp.getGroupsByUserId(uid);
          const first = asId(ids?.[0]);
          if (first) { selectAndSync(first); return; }
        }
      } catch { /* ignore */ }
      const firstVisible = asId(groups[0]?.id);
      if (firstVisible) selectAndSync(firstVisible);
    })();
  }, [groups, currentSelectedGroupId, authData?.usergroupid, authData?.userid]);

  return { currentSelectedGroupId, selectAndSync, clearSelection };
}

export { useGroupSelection };