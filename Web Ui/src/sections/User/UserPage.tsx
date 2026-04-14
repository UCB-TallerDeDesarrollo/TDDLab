import { useState, useEffect, useMemo } from "react";
import { Container, CircularProgress, TableContainer } from "@mui/material";
import { styled } from "@mui/system";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";

import UsersHeader from "./UsersHeader";
import UsersTable from "./UsersTable";

// ------------------- ESTILOS -------------------
const CenteredContainer = styled(Container)({
  marginTop: "28px",
});

const DividerLine = styled("div")({
  width: "82%",
  height: "1px",
  backgroundColor: "#8f8f8f",
  margin: "10px auto 16px auto",
});

const StyledTableContainer = styled(TableContainer)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  boxShadow: "none",
  backgroundColor: "#fff",
});
// -------------------------------------------------

function UserPage() {
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <CenteredContainer>
      <UsersHeader
        searchQuery={searchQuery}
        selectedGroup={selectedGroup}
        groups={groups}
        onSearchChange={setSearchQuery}
        onGroupChange={handleGroupChange}
      />

      <DividerLine />

      <StyledTableContainer>
        <UsersTable
          users={filteredUsers}
          groupMap={groupMap}
          onRemoveUser={handleRemoveUserFromGroup}
        />
      </StyledTableContainer>
    </CenteredContainer>
  );
}

export default UserPage;