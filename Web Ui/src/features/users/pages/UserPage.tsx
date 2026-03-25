import { useState, useEffect, useMemo } from "react";

import GetUsers from "../../../modules/Users/application/getUsers";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../../modules/Users/application/removeUserFromGroup";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container,
  Select, MenuItem, InputLabel, FormControl, CircularProgress,
  SelectChangeEvent, Tooltip, TextField, InputAdornment
} from "@mui/material";

import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";

import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";

import { SearchUsersByEmail } from "../../../modules/Users/application/SearchUsersByEmail";

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
  borderCollapse: "collapse",
  border: "1px solid #E0E0E0",
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
          <div
            style={{
              width: "82%",
              boxSizing: "border-box", // <-- Esta línea es la que soluciona que la barra sobresalga
              margin: "20px auto",
              padding: "16px 20px",
              border: "1px solid #CFCFCF",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F9F9F9",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#1B3A57",
                marginLeft: "25%",
              }}>
                Usuarios
            </div>
              
            <FormControl sx={{ minWidth: 180  }}>
              <Select
                value={selectedGroup}
                onChange={handleGroupChange}
                displayEmpty
                size="small"
                sx={{
                  backgroundColor: "#1976D2",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "13px",
                  height: "32px",
                  minWidth: "160px",

                  ".MuiSelect-select": {
                    padding: "6px 10px",
                    display: "flex",
                    alignItems: "center",
                  },

                  ".MuiSvgIcon-root": {
                    color: "#fff",
                    fontSize: "18px",
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
              >
                <MenuItem value="all">Filtrar todos los grupos</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </FilterContainer>
                    
        <div
          style={{
            width: "82%", // <-- Cambias el 85% por 82% para que calce perfecto con todo lo demás
            height: "1px",
            backgroundColor: "#D3D3D3",
            margin: "10px auto 20px auto",
          }}
        />

        <section className="Usuarios">
          <StyledTable>
            <TableHead>
                <TableRow sx={{borderBottom: "1px solid #E0E0E0",backgroundColor: "#E5E5E5",}}>                
                <TableCell sx={{fontWeight: 600,fontSize: "18px",color: "#222",borderRight: "1px solid #CFCFCF",textAlign: "center", fontFamily: "Roboto, Arial, sans-serif",}}>Correo</TableCell>
                <TableCell sx={{fontWeight: 600,fontSize: "18px",color: "#222",borderRight: "1px solid #CFCFCF",textAlign: "center", fontFamily: "Roboto, Arial, sans-serif",}}>Grupo</TableCell>
                <TableCell sx={{fontWeight: 600,fontSize: "18px",color: "#222",borderRight: "1px solid #CFCFCF",textAlign: "center", fontFamily: "Roboto, Arial, sans-serif",}}>Rol</TableCell>
                <TableCell sx={{fontWeight: 600,fontSize: "18px",color: "#222",borderRight: "1px solid #CFCFCF",textAlign: "center", fontFamily: "Roboto, Arial, sans-serif",}}>Eliminar</TableCell>
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
                    <TableCell sx={{ borderRight: "1px solid #E0E0E0", textAlign: "left", paddingLeft: "10%" }}>{user.email}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #E0E0E0", textAlign: "left", paddingLeft: "7%" }}>{groupMap[user.groupid] || "Unknown"}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #E0E0E0", textAlign: "center" }}>{user.role}</TableCell>
                    <TableCell sx={{ borderRight: "none", textAlign: "center" }}>
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
