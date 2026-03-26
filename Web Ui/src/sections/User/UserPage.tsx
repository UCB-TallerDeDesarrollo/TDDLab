import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container, Select, MenuItem, InputLabel, FormControl,
  CircularProgress, SelectChangeEvent, Tooltip, TextField, InputAdornment, TableContainer,
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
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
});

const StyledTableContainer = styled(TableContainer)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "20px",
  boxShadow: "none",
  backgroundColor: "#fff",
});

const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
});

const FilterContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  marginBottom: "20px",
  gap: "20px",
});

const DividerLine = styled("div")({
  width: "82%",
  height: "3px",
  backgroundColor: "#cfcfcf",
  margin: "10px auto 20px auto",
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

          <FormControl variant="outlined" sx={{ minWidth: 250 }}>
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

        <DividerLine />

        <section className="Usuarios" style={{ width: "100%" }}>
          <StyledTableContainer>
            <StyledTable>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 560,
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: "1px solid #d9d9d9",
                    }}
                  >
                    Correo
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 560,
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: "1px solid #d9d9d9",
                    }}
                  >
                    Grupo
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 560,
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: "1px solid #d9d9d9",
                    }}
                  >
                    Rol
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 560,
                      borderBottom: "1px solid #d9d9d9",
                      textAlign: "center",
                    }}
                  >
                    Eliminar
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        textAlign: "center",
                        py: 3,
                        borderBottom: "1px solid #d9d9d9",
                      }}
                    >
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #d9d9d9",
                          borderRight: "1px solid #d9d9d9",
                        }}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #d9d9d9",
                          borderRight: "1px solid #d9d9d9",
                        }}
                      >
                        {groupMap[user.groupid] || "Unknown"}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #d9d9d9",
                          borderRight: "1px solid #d9d9d9",
                        }}
                      >
                        {user.role}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #d9d9d9",
                          textAlign: "center",
                        }}
                      >
                        <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                          <RemoveCircleIcon
                            onClick={() => handleRemoveUserFromGroup(user.id)}
                            sx={{
                              color: "#d81b1b",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </StyledTable>
          </StyledTableContainer>
        </section>
      </CenteredContainer>
    </div>
  );
}

export default UserPage;