import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container,
  Select, MenuItem, InputLabel, FormControl, CircularProgress,
  SelectChangeEvent, Tooltip, TextField, InputAdornment
} from "@mui/material";

import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import UpdateUserRole from "../../modules/Users/application/updateUserRole.ts";
import GetCurrentUserRole from "../../modules/Users/application/getCurrentUserRole";

import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";

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
  marginTop: "20px",
});

const FilterContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  marginBottom: "20px",
  gap: "20px",
});

// -------------------------------------------------

function UserPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  // --- INSTANCIAS ---
  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);
  const getCurrentUserRole = useMemo(() => new GetCurrentUserRole(userRepository), [userRepository]);

  const searchUsersByEmail = useMemo(
    () => new SearchUsersByEmail(userRepository),
    [userRepository]
  );

  // ------------------- FETCH USERS + GROUPS -------------------
  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [userData, groupData, role] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups(),
          getCurrentUserRole.execute(),
        ]);

        setUsers(userData);
        setGroups(groupData);
        setCurrentUserRole(role);
      } catch (error) {
        console.error("Error fetching users or groups:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndGroups();
  }, [getUsers, getGroups, getCurrentUserRole]);

  // ------------------- FILTRO DE USUARIOS -------------------
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

  const handleRoleChange = async (userId: number, newRole: string, oldRole: string, userName: string) => {
    if (newRole === oldRole) {
      return;
    }

    const confirmMessage = `¿Estás seguro que deseas cambiar el rol de ${userName} de ${oldRole} a ${newRole}?`;
    
    if (!window.confirm(confirmMessage)) {
      return; 
    }

    try {
      const userRepository = new UsersRepository();
      const updateRoleInstance = new UpdateUserRole(userRepository);
      await updateRoleInstance.updateUserRole(userId, newRole);

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert("Rol actualizado con éxito");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar el rol");
      
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: oldRole } : user
      ));
    }
  };

  const getRoleOptions = (userRole: string) => {
    if (currentUserRole === "admin") {
      return [
        <MenuItem key="student" value="student">Student</MenuItem>,
        <MenuItem key="teacher" value="teacher">Teacher</MenuItem>,
        <MenuItem key="admin" value="admin">Admin</MenuItem>
      ];
    }

    if (currentUserRole === "teacher") {
      const options = [];
      if (userRole === "admin") {
        options.push(<MenuItem key="admin" value="admin">Admin</MenuItem>);
      }
      options.push(
        <MenuItem key="student" value="student">Student</MenuItem>,
        <MenuItem key="teacher" value="teacher">Teacher</MenuItem>
      );
      return options;
    }

    return [<MenuItem key={userRole} value={userRole}>{userRole}</MenuItem>];
  };

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
        <FilterContainer>
          <TextField
            label="Buscar por email"
            variant="outlined"
            placeholder="Ej: nombre@ucb.edu.bo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="group-filter-label">Grupo</InputLabel>
            <Select
              labelId="group-filter-label"
              value={selectedGroup}
              onChange={handleGroupChange}
              label="Grupo"
            >
              <MenuItem value="all">Todos los grupos</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FilterContainer>

        <section className="Usuarios">
          <StyledTable>
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid #E7E7E7" }}>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "30%",
                    lineHeight: "2",
                  }}
                >
                  Nombre
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "30%",
                    lineHeight: "2",
                  }}
                >
                  Apellido
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "30%",
                    lineHeight: "2",
                  }}
                >
                  Correo electrónico
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "30%",
                    lineHeight: "2",
                  }}
                >
                  Grupo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "20%",
                    lineHeight: "2",
                  }}
                >
                  Rol
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 560,
                    color: "#333",
                    fontSize: "1rem",
                    width: "10%",
                    lineHeight: "2",
                  }}
                >
                  Eliminar
                </TableCell>
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
                  <TableRow key={user.id} sx={{ borderBottom: "2px solid #E7E7E7" }}>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{groupMap[user.groupid] || "Unknown"}</TableCell>
                    <TableCell sx={{ lineHeight: "3" }}>
                      <Select
                        value={user.role || ""}
                        onChange={(e) => handleRoleChange(
                          user.id, 
                          e.target.value, 
                          user.role, 
                          `${user.firstName} ${user.lastName}`
                        )}
                        size="small"
                        sx={{
                          minWidth: 120,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E7E7E7",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#333",
                          },
                        }}
                        disabled={currentUserRole === "student"}
                      >
                      {getRoleOptions(user.role)}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                      <RemoveCircleIcon
                        onClick={() => handleRemoveUserFromGroup(user.id)}
                        aria-label="Eliminar usuario"
                        sx={{
                          color: "#d81b1b",
                          transition: "color 0.3s ease",
                          "&:hover": {
                            color: "#a10e0e",
                            cursor: "pointer"
                          },
                        }}
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