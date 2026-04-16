import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container,
  Select, MenuItem, InputLabel, FormControl,
  SelectChangeEvent, Tooltip, TextField, InputAdornment, Chip
} from "@mui/material";
import { CircularProgress, Box } from "@mui/material";

import { styled } from "@mui/system";
import { IconifyIcon } from "../../sections/Shared/Components";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";

// -------------------  ESTILOS  -------------------
const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
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
  const [, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  // --- INSTANCIAS ---
  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  const searchUsersByEmail = useMemo(
    () => new SearchUsersByEmail(userRepository),
    [userRepository]
  );

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

  // ------------------- RENDER -------------------
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
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
                  <IconifyIcon icon="mdi:magnify" width={20} height={20} color="gray" hoverColor="#333" />
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
          <StyledTable sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#EAF2FC" }}>
                <TableCell align="center" sx={{ fontWeight: "bold", borderTopLeftRadius: "12px", borderBottom: 'none', py: 2 }}>Usuario</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", borderBottom: 'none', py: 2 }}>Grupo</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", borderBottom: 'none', py: 2 }}>Rol</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", borderTopRightRadius: "12px", borderBottom: 'none', py: 2 }}>Opciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, borderBottom: "1px solid #E7E7E7" }}>
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #E7E7E7", py: 2.5 }}>{user.email}</TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #E7E7E7", py: 2.5 }}>{groupMap[user.groupid] || "Unknown"}</TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #E7E7E7", py: 2.5 }}>
                      <Chip
                        label={user.role.toLowerCase() === 'teacher' || user.role.toLowerCase() === 'docente' ? 'Docente' : 'Estudiante'}
                        size="medium"
                        sx={{
                          backgroundColor: (user.role.toLowerCase() === 'docente' || user.role.toLowerCase() === 'teacher') ? '#A8CCFF' : '#AEF9A8',
                          color: (user.role.toLowerCase() === 'docente' || user.role.toLowerCase() === 'teacher') ? '#2B5A9D' : '#308B29',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: 400
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #E7E7E7", py: 2.5 }}>
                      <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                        <button 
                          onClick={() => handleRemoveUserFromGroup(user.id)} 
                          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                        >
                          <IconifyIcon icon="mdi:trash-can" color="#9E9E9E" width={24} height={24} hoverColor="#616161" />
                        </button>
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
