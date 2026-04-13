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

        setFilteredUsers((prev) =>
          prev.filter((user) => user.id !== selectedUserId)
        );

        setValidationDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmationOpen(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <Container className="centered-container">
      <div className="filter-container" style={{ marginBottom: '24px', gap: '16px' }}>
        <TextField
          label="Buscar por email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ 
            width: 360,
            '& .MuiOutlinedInput-root': { height: 36, borderRadius: '4px' } 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="group-select-label">Filtrar por Grupo</InputLabel>
          <Select 
            labelId="group-select-label"
            value={selectedGroup} 
            onChange={handleGroupChange} 
            label="Filtrar por Grupo"
            className="select-compact" // Altura de 36px y fuente Inter
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

      <Table className="styled-table">
        <TableHead>
          <TableRow className="table-row-bordered">
            <TableCell className="table-cell-header">Correo</TableCell>
            <TableCell className="table-cell-header">Grupo</TableCell>
            <TableCell className="table-cell-header">Rol</TableCell>
            <TableCell className="table-cell-header">Eliminar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No hay resultados
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id} className="table-row-bordered">
                <TableCell>{user.email}</TableCell>
                <TableCell>{groupMap[user.groupid] || "Unknown"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Tooltip title="Eliminar" arrow>
                    <RemoveCircleIcon
                      onClick={() => handleOpenRemoveDialog(user.id)}
                      sx={{ color: "#d81b1b", cursor: "pointer" }}
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
        onCancel={() => {
          setConfirmationOpen(false);
          setSelectedUserId(null);
        }}
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