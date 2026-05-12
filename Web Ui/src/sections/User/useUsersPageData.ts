import { useEffect, useMemo, useState } from "react";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsers from "../../modules/Users/application/getUsers";
import GetGroups from "../../modules/Groups/application/GetGroups";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

export function useUsersPageData() {
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);
  const searchUsersByEmail = useMemo(
    () => new SearchUsersByEmail(userRepository),
    [userRepository]
  );

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [, groupData] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups(),
        ]);

        setGroups(groupData);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndGroups();
  }, [getUsers, getGroups]);

  useEffect(() => {
    const runSearch = async () => {
      const results = await searchUsersByEmail.execute({
        query: searchQuery,
        groupId: selectedGroup,
      });

      setFilteredUsers(results);
    };

    runSearch();
  }, [searchQuery, selectedGroup, searchUsersByEmail]);

  const groupMap = useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.id] = group.groupName;
      return acc;
    }, {} as { [key: number]: string });
  }, [groups]);

  const handleGroupChange = (value: number | "all") => {
    setSelectedGroup(value);
  };

  const handleRemoveUserFromGroup = async (userId: number) => {
    if (window.confirm("¿Estás seguro que deseas eliminar del grupo a este estudiante?")) {
      try {
        const removeUserInstance = new RemoveUserFromGroup(userRepository);
        await removeUserInstance.removeUserFromGroup(userId);
        alert("Estudiante eliminado con éxito del grupo.");
        window.location.reload();
      } catch (removeError) {
        console.error(removeError);
        alert("Hubo un error al eliminar al estudiante.");
      }
    }
  };

  return {
    groups, selectedGroup, searchQuery, loading, error,
    filteredUsers, groupMap, setSearchQuery, handleGroupChange, handleRemoveUserFromGroup,
  };
}