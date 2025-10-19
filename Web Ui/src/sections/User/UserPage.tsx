import { useState, useEffect, useMemo } from "react";
import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup.ts";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  SelectChangeEvent,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/system";
import LogoutIcon from "@mui/icons-material/Logout";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

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
});

function UserPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const getUsers = useMemo(() => new GetUsers(new UsersRepository()), []);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [userData, groupData] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups(),
        ]);

        if (!Array.isArray(userData)) {
          throw new Error("Users data is not an array");
        }

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

  type GroupMap = { [key: number]: string };

  const groupMap: GroupMap = groups.reduce((acc: GroupMap, group) => {
    acc[group.id] = group.groupName;
    return acc;
  }, {});

  const handleGroupChange = (event: SelectChangeEvent<number | "all">) => {
    setSelectedGroup(event.target.value as number | "all");
  };

  const handleRemoveUserFromGroup = async (userId: number) => {
    if (window.confirm("¿Estás seguro que deseas eliminar del grupo a este estudiante?")) {
      try {
        console.log(userId)
        const userRepository = new UsersRepository();
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

  const filteredUsers = selectedGroup === "all"
    ? users
    : users.filter((user) => user.groupid === selectedGroup);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <div>
      <CenteredContainer>
        <FilterContainer>
          <FormControl variant="outlined">
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{ borderBottom: "2px solid #E7E7E7" }}>
                  <TableCell sx={{ lineHeight: "3" }}>{user.email}</TableCell>
                  <TableCell sx={{ lineHeight: "3" }}>
                    {groupMap[user.groupid] || "Unknown Group"}
                  </TableCell>
                  <TableCell sx={{ lineHeight: "3" }}>{user.role}</TableCell>
                  <TableCell
                    sx={{
                      lineHeight: "3",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderBottom: "none"
                    }}
                  >
                    <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                      <RemoveCircleIcon
                        onClick={() => handleRemoveUserFromGroup(user.id)}
                        aria-label="Eliminar usuario"
                        sx={{
                          color: "#d81b1b",
                          transition: "color 0.3s ease",
                          "&:hover": {
                            color: "#a10e0e",
                          },
                        }}
                      >
                        <LogoutIcon />
                      </RemoveCircleIcon>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </section>
      </CenteredContainer>
    </div>
  );
}

export default UserPage;
