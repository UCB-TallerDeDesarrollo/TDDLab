import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container,
  Select, MenuItem, FormControl, CircularProgress,
  SelectChangeEvent, Tooltip, Typography, Divider
} from "@mui/material";

import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";


// -------------------  ESTILOS  -------------------
const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "24px",
  borderCollapse: "collapse",
});

const HeaderContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "82%",
  marginTop: "8px",
  marginBottom: "8px",
  gap: "20px",
});

// -------------------------------------------------

function UserPage() {
  const [, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  // --- INSTANCIAS ---
  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  // ------------------- FETCH USERS + GROUPS -------------------
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

  // ------------------- FILTRO DE USUARIOS -------------------
  useEffect(() => {
    const runSearch = async () => {
      const allUsers = await getUsers.getUsers();

      const results =
        selectedGroup === "all"
          ? allUsers
          : allUsers.filter((user) => user.groupid === selectedGroup);

      setFilteredUsers(results);
    };

    runSearch();
  }, [selectedGroup, getUsers]);

  // ------------------- MAPA DE GRUPOS -------------------
  const groupMap = groups.reduce((acc, group) => {
    acc[group.id] = group.groupName;
    return acc;
  }, {} as { [key: number]: string });

  // ------------------- HANDLERS -------------------
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

  // ------------------- RENDER -------------------
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <CenteredContainer>
        <HeaderContainer>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Usuarios
          </Typography>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 220 }}>
            <Select
              value={selectedGroup}
              onChange={handleGroupChange}
              displayEmpty
            >
              <MenuItem value="all">Filtrar todos los grupos</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </HeaderContainer>

        <Divider sx={{ width: "82%" }} />

        <section className="Usuarios">
          <StyledTable>
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid #CFCFCF" }}>
                <TableCell sx={{ fontWeight: 560 }}>Correo</TableCell>
                <TableCell sx={{ fontWeight: 560, borderLeft: "1px solid #CFCFCF" }}>Grupo</TableCell>
                <TableCell sx={{ fontWeight: 560, borderLeft: "1px solid #CFCFCF" }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 560, borderLeft: "1px solid #CFCFCF" }}>Eliminar</TableCell>
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
                  <TableRow key={user.id} sx={{ borderBottom: "1px solid #CFCFCF" }}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell sx={{ borderLeft: "1px solid #CFCFCF" }}>{groupMap[user.groupid] || "Unknown"}</TableCell>
                    <TableCell sx={{ borderLeft: "1px solid #CFCFCF" }}>{user.role}</TableCell>
                    <TableCell sx={{ borderLeft: "1px solid #CFCFCF" }}>
                      <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                        <RemoveCircleIcon
                          onClick={() => handleRemoveUserFromGroup(user.id)}
                          sx={{ color: "#d81b1b" }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </StyledTable>
        </section>
      </CenteredContainer>
    </div>
  );
}

export default UserPage;
