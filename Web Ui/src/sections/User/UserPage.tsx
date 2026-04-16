import { useState, useEffect, useMemo } from "react";
import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";
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
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";
import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import "../../App.css";

function UserPage() {
  const [, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);
  const searchUsersByEmail = useMemo(
    () => new SearchUsersByEmail(userRepository),
    [userRepository]
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "teacher": return "Docente";
      case "student": return "Estudiante";
      default: return role;
    }
  };

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [userData, groupData] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups(),
        ]);
        setUsers(userData);
        setGroups(groupData);
      } catch (err) {
        setError(err);
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

  const handleOpenRemoveDialog = (userId: number) => {
    setSelectedUserId(userId);
    setConfirmationOpen(true);
  };

  const handleConfirmRemoveUser = async () => {
    try {
      if (selectedUserId !== null) {
        const removeUserInstance = new RemoveUserFromGroup(userRepository);
        await removeUserInstance.removeUserFromGroup(selectedUserId);
        setFilteredUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
        setValidationDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmationOpen(false);
      setSelectedUserId(null);
    }
  };

  if (loading) return <div className="fullscreen-loading"><CircularProgress /></div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <Container className="centered-container">
      <div className="page-header">
        <h2 className="section-title"></h2>
          <div className="filter-container">
          <TextField
            label="Buscar por email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small" // Asegura el tamaño pequeño
            sx={{ width: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}> {/* Añadido size="small" */}
            <InputLabel id="group-select-label">Filtrar por Grupo</InputLabel>
            <Select 
              labelId="group-select-label"
              value={selectedGroup} 
              onChange={handleGroupChange} 
              label="Filtrar por Grupo"
              className="select-compact"
            >
              <MenuItem value="all">Todos los grupos</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <Table className="styled-table">
        <TableHead>
          <TableRow>
            <TableCell className="table-cell-header">Correo</TableCell>
            <TableCell className="table-cell-header">Grupo</TableCell>
            <TableCell className="table-cell-header">Rol</TableCell>
            <TableCell className="table-cell-header" align="center">Eliminar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow><TableCell colSpan={4} align="center">No hay resultados</TableCell></TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{groupMap[user.groupid] || "Sin grupo"}</TableCell>
                <TableCell>{getRoleLabel(user.role)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar" arrow>
                    <RemoveCircleIcon
                      onClick={() => handleOpenRemoveDialog(user.id)}
                      // IMPORTANTE: Ahora el color funcionará porque quitamos el !important del body *
                      sx={{ 
                        color: "#d81b1b", 
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmationDialog
        open={confirmationOpen}
        title="¿Estás seguro que deseas eliminar este estudiante?"
        content="El estudiante será removido del grupo actual."
        cancelText="Cancelar"
        deleteText="Eliminar"
        onCancel={() => { setConfirmationOpen(false); setSelectedUserId(null); }}
        onDelete={handleConfirmRemoveUser}
      />

      <ValidationDialog
        open={validationDialogOpen}
        title="Estudiante eliminado exitosamente"
        closeText="Cerrar"
        onClose={() => setValidationDialogOpen(false)}
      />
    </Container>
  );
}

export default UserPage;