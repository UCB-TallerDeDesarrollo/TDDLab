import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

import {
  getUsersByGroupIdService,
  getGroupDetailService,
} from "../services/users.service";

function useUsersByGroupPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const [group, setGroup] = useState<GroupDataObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const { groupid } = useParams<{ groupid?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!groupid) {
        setError(new Error("Group ID is undefined"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const parsedId = parseInt(groupid, 10);

        const [groupDetail, userData] = await Promise.all([
          getGroupDetailService(parsedId),
          getUsersByGroupIdService(parsedId),
        ]);

        setGroup(groupDetail);
        setUsers(userData);
      } catch (err) {
        console.error("Error fetching users by group:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupid]);

  return {
    users,
    group,
    loading,
    error,
  };
}

export default useUsersByGroupPage;