import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Container, Select, MenuItem, FormControl, CircularProgress,
  SelectChangeEvent, Tooltip, TableContainer, TextField, InputAdornment,
} from "@mui/material";

import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";

// ------------------- ESTILOS -------------------
const CenteredContainer = styled(Container)({
  marginTop: "28px",
});

const HeaderContainer = styled("div")({
  width: "82%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const HeaderFilters = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const Title = styled("h2")({
  fontSize: "18px",
  fontWeight: 600,
  margin: 0,
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

const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
});

// ------------------- ESTILOS DE CELDAS -------------------
const headerCellSx = {
  fontWeight: 600,
  borderBottom: "1px solid #d9d9d9",
  borderRight: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const lastHeaderCellSx = {
  fontWeight: 600,
  borderBottom: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const bodyCellSx = {
  borderBottom: "1px solid #d9d9d9",
  borderRight: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const lastBodyCellSx = {
  borderBottom: "1px solid #d9d9d9",
  padding: "10px 8px",
};
// -------------------------------------------------

function UserPage() {
  const [, setUsers] = useState<UserDataObject[]>([]);
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
        const [userData, groupData] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups(),
        ]);

        setUsers(userData);
        setGroups(groupData);
      } catch (error) {
        console.error("Error fetching users or groups:", error);
        setError(error);
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

  const groupMap = groups.reduce((acc, group) => {
    acc[group.id] = group.groupName;
    return acc;
  }, {} as { [key: number]: string });

  const handleGroupChange = (event: SelectChangeEvent<number | "all">) => {
    setSelectedGroup(event.target.value as number | "all");
  };

  const handleRemoveUserFromGroup = async (userId: number) => {
    if (window.confirm("¿Estás seguro que deseas eliminar del grupo a este estudiante?")) {
      try {
        const removeUserInstance = new RemoveUserFromGroup(userRepository);
        await removeUserInstance.removeUserFromGroup(userId);
        alert("Estudiante eliminado con éxito del grupo.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Hubo un error al eliminar al estudiante del grupo.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <CenteredContainer>
      <HeaderContainer>
        <Title>Usuarios</Title>

        <HeaderFilters>
          <TextField
            placeholder="Buscar por email"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value={selectedGroup} onChange={handleGroupChange} displayEmpty>
              <MenuItem value="all">Filtrar todos los grupos</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </HeaderFilters>
      </HeaderContainer>

      <DividerLine />

      <StyledTableContainer>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Correo</TableCell>
              <TableCell sx={headerCellSx}>Grupo</TableCell>
              <TableCell sx={headerCellSx}>Rol</TableCell>
              <TableCell sx={lastHeaderCellSx}>Eliminar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={bodyCellSx}>{user.email}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {groupMap[user.groupid] || "Unknown"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{user.role}</TableCell>
                  <TableCell sx={lastBodyCellSx}>
                    <Tooltip title="Eliminar" arrow>
                      <RemoveCircleIcon
                        onClick={() => handleRemoveUserFromGroup(user.id)}
                        sx={{ color: "#ff1a1a", cursor: "pointer" }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </CenteredContainer>
  );
}

export default UserPage;