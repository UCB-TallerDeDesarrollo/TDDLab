import { useState, useEffect, useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { RemoveUserFromGroup } from "../../modules/Users/application/removeUserFromGroup";
import { UpdateUser } from "../../modules/Users/application/updateUser";

import {
  Table, TableHead, TableBody, TableRow, TableCell, Container,
  Select, MenuItem, InputLabel, FormControl,
  SelectChangeEvent, Tooltip, TextField, InputAdornment, Chip, Typography, Divider,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent, Box,
} from "@mui/material";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { UserSkeleton } from "../../components/Skeleton";
import Skeleton from "@mui/material/Skeleton";

import { styled } from "@mui/system";
import { IconifyIcon } from "../../sections/Shared/Components";

import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

import { SearchUsersByEmail } from "../../modules/Users/application/SearchUsersByEmail";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";

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
  alignItems: "center",
  gap: "20px",
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "12px",
  flexWrap: "wrap",
});

const CardsContainer = styled(Box)({
  width: "100%",
  padding: "20px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const UserCard = styled(Card)({
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  padding: "0",
});

// -------------------------------------------------

function UserPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [, setUsers] = useState<UserDataObject[]>([]);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedUserForRemoval, setSelectedUserForRemoval] = useState<UserDataObject | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignGroupId, setAssignGroupId] = useState<number | "">("");

  // --- INSTANCIAS ---
  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsers = useMemo(() => new GetUsers(userRepository), [userRepository]);
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  const searchUsersByEmail = useMemo(
    () => new SearchUsersByEmail(userRepository),
    [userRepository]
  );

  // ------------------- FETCH USERS + GROUPS -------------------
  const loadUsersAndGroups = async () => {
    setLoading(true);
    try {
      const [userData, groupData] = await Promise.all([
        getUsers.getUsers(),
        getGroups.getGroups(),
      ]);

      setUsers(userData);
      setGroups(groupData);
    } catch (fetchError) {
      console.error("Error fetching users or groups:", fetchError);
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndGroups();
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

  const openRemoveConfirmation = (user: UserDataObject) => {
    setSelectedUserForRemoval(user);
    setConfirmationOpen(true);
  };

  const handleRemoveUserFromGroup = async () => {
    if (!selectedUserForRemoval) {
      setConfirmationOpen(false);
      return;
    }

    try {
      const removeUserInstance = new RemoveUserFromGroup(userRepository);
      await removeUserInstance.removeUserFromGroup(selectedUserForRemoval.id);
      setValidationMessage("Usuario eliminado del grupo exitosamente.");
      setValidationDialogOpen(true);
      await loadUsersAndGroups();
    } catch (removeError) {
      console.error(removeError);
      setValidationMessage("Hubo un error al eliminar al usuario del grupo.");
      setValidationDialogOpen(true);
    } finally {
      setConfirmationOpen(false);
      setSelectedUserForRemoval(null);
    }
  };

  const openAddUserDialog = () => {
    setAssignEmail("");
    setAssignGroupId(selectedGroup !== "all" ? selectedGroup : "");
    setAddUserDialogOpen(true);
  };

  const handleAssignUserToGroup = async () => {
    if (!assignEmail.trim() || assignGroupId === "") {
      setValidationMessage("Completa el correo y el grupo para continuar.");
      setValidationDialogOpen(true);
      return;
    }

    try {
      const user = await userRepository.getUserByEmail(assignEmail.trim());

      if (!user) {
        setValidationMessage("No se encontró un usuario con ese correo.");
        setValidationDialogOpen(true);
        return;
      }

      const updateUser = new UpdateUser(userRepository);
      await updateUser.updateUser(user.id, Number(assignGroupId));

      setValidationMessage("Usuario asignado al grupo exitosamente.");
      setValidationDialogOpen(true);
      setAddUserDialogOpen(false);
      await loadUsersAndGroups();
    } catch (assignError) {
      console.error(assignError);
      setValidationMessage("Hubo un error al asignar al usuario al grupo.");
      setValidationDialogOpen(true);
    }
  };

  // ------------------- RENDER -------------------
  if (loading) return (
    <div>
      <CenteredContainer sx={{ maxWidth: '100% !important', pb: 4 }}>
        <div className="section-header" style={{ marginTop: "32px" }}>
          <Skeleton variant="text" width={200} height={40} sx={{ fontWeight: 800, mb: 0.5, fontSize: '2.5rem' }} />
          <div className="section-actions">
            <Skeleton variant="rectangular" width={180} height={56} sx={{ borderRadius: "14px" }} />
          </div>
        </div>

        <FilterContainer>
          <Skeleton variant="rectangular" width={360} height={56} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: "8px" }} />
        </FilterContainer>

        <Divider sx={{ width: '82%', margin: '0 auto', mt: 2, mb: 4, borderColor: '#D9D9D9' }} />

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
              <UserSkeleton count={5} />
            </TableBody>
          </StyledTable>
        </section>
      </CenteredContainer>
    </div>
  );

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <CenteredContainer sx={{ maxWidth: '100% !important', pb: 4 }}>
        <div className="section-header" style={{ marginTop: "32px" }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: isMobile ? '2rem' : '2.5rem' }}>
            Usuarios
          </Typography>
          <div className="section-actions">
            <Button
              variant="contained"
              color="primary"
              onClick={openAddUserDialog}
              sx={{ borderRadius: "14px", textTransform: "none", height: "56px", px: 3 }}
            >
              Añadir Usuario
            </Button>
          </div>
        </div>

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

        <Divider sx={{ width: '82%', margin: '0 auto', mt: 2, mb: 4, borderColor: '#D9D9D9' }} />

        {isMobile ? (
          <CardsContainer>
            {filteredUsers.length === 0 ? (
              <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                No se encontraron resultados
              </Typography>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user.id}>
                  <CardContent sx={{ pb: 2, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                        <IconButton 
                          onClick={() => openRemoveConfirmation(user)}
                          size="small"
                          sx={{ color: '#9E9E9E', '&:hover': { color: '#616161' } }}
                        >
                          <IconifyIcon icon="mdi:trash-can" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#999', fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                        Usuario
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, fontSize: '1rem' }}>
                        {user.email}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#999', fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                        Grupo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, fontSize: '1rem' }}>
                        {groupMap[user.groupid] || "Unknown"}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#999', fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                        Rol
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={user.role.toLowerCase() === 'teacher' || user.role.toLowerCase() === 'docente' ? 'Docente' : 'Estudiante'}
                          size="small"
                          sx={{
                            backgroundColor: (user.role.toLowerCase() === 'docente' || user.role.toLowerCase() === 'teacher') ? '#A8CCFF' : '#AEF9A8',
                            color: (user.role.toLowerCase() === 'docente' || user.role.toLowerCase() === 'teacher') ? '#2B5A9D' : '#308B29',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </UserCard>
              ))
            )}
          </CardsContainer>
        ) : (
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
                          <IconButton onClick={() => openRemoveConfirmation(user)}>
                            <IconifyIcon icon="mdi:trash-can" color="#9E9E9E" width={24} height={24} hoverColor="#616161" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </StyledTable>
          </section>
        )}

        <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Añadir usuario al grupo</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Correo del usuario"
              type="email"
              fullWidth
              variant="outlined"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
            />
            <FormControl variant="outlined" fullWidth sx={{ mt: 2 }}>
              <InputLabel id="assign-group-label">Grupo</InputLabel>
              <Select
                labelId="assign-group-label"
                value={assignGroupId}
                onChange={(e) => setAssignGroupId(e.target.value as number)}
                label="Grupo"
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddUserDialogOpen(false)} color="primary">Cancelar</Button>
            <Button 
              onClick={handleAssignUserToGroup} 
              color="primary" 
              variant="contained"
              disabled={assignEmail.trim() === "" || assignGroupId === ""}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar al usuario del grupo?"
            content={
              <>
                {selectedUserForRemoval?.email}
                <br />
                será removido del grupo actual.
              </>
            }
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={() => {
              setConfirmationOpen(false);
              setSelectedUserForRemoval(null);
            }}
            onDelete={handleRemoveUserFromGroup}
          />
        )}

        {validationDialogOpen && (
          <ValidationDialog
            open={validationDialogOpen}
            title={validationMessage}
            closeText="Cerrar"
            onClose={() => setValidationDialogOpen(false)}
          />
        )}
      </CenteredContainer>
    </div>
  );
}

export default UserPage;
