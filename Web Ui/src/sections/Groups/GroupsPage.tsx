import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import CreateGroupPopup from "../Groups/components/GroupsForm";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Button,
  Collapse,
  Box,
  Typography,
  TableContainer,
  Paper,
  Stack,
} from "@mui/material";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import EditGroupPopup from "./components/EditGroupForm";
import { useGroupsData } from "./hooks/useGroupsData";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function Groups() {
  const navigate = useNavigate();

  const {
    groups,
    currentSelectedGroupId,
    selectedSorting,
    selectAndSync,
    handleGroupsOrder,
    deleteGroupItem,
    handleGroupCreated,
    handleGroupUpdated,
  } = useGroupsData();

  // UI state
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);

  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);

  const handleCreateGroupClick = () => {
    setCreateGroupPopupOpen(true);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const group = groups[index];
    if (group) {
      setGroupToEdit(group);
      setEditGroupPopupOpen(true);
    }
  };

  const handleRowClick = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((row) => row !== index));
    } else {
      setExpandedRows([index]);
    }

    const clickedGroup = groups[index];
    if (!clickedGroup?.id) return;

    setSelectedRow(index);
    selectAndSync(clickedGroup.id);
  };

  const handleRowHover = (index: number | null) => setHoveredRow(index);
  const isRowSelected = (index: number) => index === selectedRow || index === hoveredRow || asId(currentSelectedGroupId) === asId(groups[index]?.id);

  const navigateToHomeworks = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const clickedGroup = groups[index];
    if (clickedGroup?.id) {
      selectAndSync(clickedGroup.id);
      navigate(`/?groupId=${clickedGroup.id}`);
    }
  };

  const navigateToStudents = async (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const groupid = asId(groups[index]?.id);
    if (!groupid) return;
    try {
      selectAndSync(groupid);
      await getUsersByGroupId.execute(groupid);
      navigate(`/users/group/${groupid}`);
    } catch (error) {
      console.error("Failed to fetch users for group:", error);
    }
    setSelectedRow(index);
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedRow(index);
    setConfirmationOpen(true);
  };

  const handleLinkClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) getCourseLink(id, "student");
  };

  const handleLinkClickTeacher = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) getCourseLink(id, "teacher");
  };

  const handleConfirmDelete = async () => {
    if (selectedRow !== null) {
      await deleteGroupItem(selectedRow);
      setValidationDialogOpen(true);
    }
    setConfirmationOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
          Gestión de Grupos
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <SortingComponent
            selectedSorting={selectedSorting}
            onChangeHandler={handleGroupsOrder}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateGroupClick}
            sx={{ borderRadius: "17px", textTransform: "none", px: 3 }}
          >
            Crear Grupo
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E7E7E7", borderRadius: 2 }}>
        <Table aria-label="tabla de grupos" sx={{ minWidth: { xs: 400, md: 650 } }}>
          <TableHead sx={{ backgroundColor: "#f9fafb" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: "5%" }}></TableCell>
              <TableCell sx={{ fontWeight: 600, width: "35%", color: "text.secondary" }}>NOMBRE DEL GRUPO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay grupos disponibles
                </TableCell>
              </TableRow>
            )}
            {groups.map((group, index) => {
              const isSelected = asId(currentSelectedGroupId) === asId(group.id) || isRowSelected(index);
              const isExpanded = expandedRows.includes(index);
              
              return (
                <React.Fragment key={asId(group.id) || index}>
                  <TableRow
                    selected={isSelected}
                    onClick={() => handleRowClick(index)}
                    onMouseEnter={() => handleRowHover(index)}
                    onMouseLeave={() => handleRowHover(null)}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={asId(currentSelectedGroupId) === asId(group.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowClick(index);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: asId(currentSelectedGroupId) === asId(group.id) ? 600 : 400, color: asId(currentSelectedGroupId) === asId(group.id) ? "primary.main" : "text.primary" }}>
                      {group.groupName}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Editar grupo" arrow>
                          <IconButton size="small" aria-label="editar" onClick={(e) => handleEditClick(e, index)}>
                            <EditIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Tareas" arrow>
                          <IconButton size="small" aria-label="tareas" onClick={(e) => navigateToHomeworks(e, index)}>
                            <AutoAwesomeMotionIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Participantes" arrow>
                          <IconButton size="small" aria-label="estudiantes" onClick={(e) => navigateToStudents(e, index)}>
                            <GroupsIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Enlace estudiante" arrow>
                          <IconButton size="small" aria-label="enlace estudiante" onClick={(e) => handleLinkClick(e, index)}>
                            <LinkIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Enlace docente" arrow>
                          <IconButton size="small" aria-label="enlace docente" onClick={(e) => handleLinkClickTeacher(e, index)}>
                            <PiChalkboardTeacherFill size={20} color="var(--mui-palette-text-secondary, #666)" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar grupo" arrow>
                          <IconButton size="small" aria-label="eliminar" onClick={(e) => handleDeleteClick(e, index)}>
                            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={3} sx={{ p: 0, borderBottom: isExpanded ? "1px solid #E7E7E7" : "none" }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, pl: 9, backgroundColor: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Detalle del grupo
                          </Typography>
                          <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                            {group.groupDetail || "No hay descripción disponible para este grupo."}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {confirmationOpen && (
        <ConfirmationDialog
          open={confirmationOpen}
          title="¿Eliminar el grupo?"
          content={
            <>
              Ten en cuenta que esta acción también eliminará <br /> todas las tareas asociadas.
            </>
          }
          cancelText="Cancelar"
          deleteText="Eliminar"
          onCancel={() => setConfirmationOpen(false)}
          onDelete={handleConfirmDelete}
        />
      )}

      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Grupo eliminado exitosamente"
          closeText="Cerrar"
          onClose={() => setValidationDialogOpen(false)}
        />
      )}

      <CreateGroupPopup
        open={createGroupPopupOpen}
        handleClose={() => setCreateGroupPopupOpen(false)}
        onCreated={handleGroupCreated}
      />

      <EditGroupPopup
        open={editGroupPopupOpen}
        handleClose={() => setEditGroupPopupOpen(false)}
        groupToEdit={groupToEdit}
        onUpdated={handleGroupUpdated}
      />
    </Container>
  );
}

export default Groups;
