import React, { useState, useMemo } from "react";
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
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Collapse,
} from "@mui/material";

import { CenteredContainer, StyledTable, ButtonContainer } from "./components/WrappedStyledComponents";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";
import { useGroups, asId } from "./hooks/useGroups";
import { useGroupSelection } from "./hooks/useGroupSelection";
import './GroupsPage.css';



function Groups() {
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);

  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsersByGroupId = useMemo(() => new GetUsersByGroupId(userRepository), [userRepository]);
  const [authData, setAuthData] = useGlobalState("authData");

  const { groups, setGroups, groupRepository, selectedSorting, handleGroupsOrder, handleGroupUpdated } = useGroups(authData);
  const { currentSelectedGroupId, selectAndSync, clearSelection } = useGroupSelection(groups, authData, setAuthData);

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

  const handleRowClick = async (index: number) => {
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
  const isRowSelected = (index: number) => index === selectedRow || index === hoveredRow;

  const handleHomeworksClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const clickedGroup = groups[index];
    if (clickedGroup?.id) navigate(`/?groupId=${clickedGroup.id}`);
  };

  const handleStudentsClick = async (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const groupid = asId(groups[index]?.id);
    if (!groupid) return;
    try {
      await getUsersByGroupId.execute(groupid);
      navigate(`/users/group/${groupid}`);
    } catch (error) {
      console.error("Failed to fetch users for group:", error);
    }
    setSelectedRow(index);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    setSelectedRow(index);
    setConfirmationOpen(true);
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) getCourseLink(id, "student");
  };

  const handleLinkClickTeacher = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) getCourseLink(id, "teacher");
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedRow !== null) {
        const itemFound = groups[selectedRow];
        if (itemFound) {
          const deleteGroup = new DeleteGroup(groupRepository);
          await deleteGroup.deleteGroup(asId(itemFound.id) || 0);
          setValidationDialogOpen(true);

          const copy = [...groups];
          copy.splice(selectedRow, 1);
          setGroups(copy);

          if (asId(currentSelectedGroupId) === asId(itemFound.id)) {
            const next = asId(copy[0]?.id);
            if (next) selectAndSync(next);
            else clearSelection();
          }
        }
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setConfirmationOpen(false);
    }
  };

  const handleValidationDialogClose = () => {
    setValidationDialogOpen(false);
  };

  const handleGroupCreated = (newGroup: GroupDataObject) => {
    setGroups((prev) => [newGroup, ...prev]);
    selectAndSync(newGroup.id);
  };


  return (
    <CenteredContainer>
      <section className="Grupos">
        <StyledTable>
          <TableHead>
            <TableRow className="groups-table-header-row">
              <TableCell>
                Grupos
              </TableCell>
              <TableCell>
                <ButtonContainer>
                  <SortingComponent
                    selectedSorting={selectedSorting}
                    onChangeHandler={handleGroupsOrder}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    className="groups-create-btn"
                    onClick={handleCreateGroupClick}
                  >
                    Crear
                  </Button>
                </ButtonContainer>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.map((group, index) => (
              <React.Fragment key={asId(group.id) || index}>
                <TableRow
                  selected={isRowSelected(index)}
                  onClick={() => handleRowClick(index)}
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={() => handleRowHover(null)}
                >
                  <TableCell>
                    <Checkbox
                      checked={asId(currentSelectedGroupId) === asId(group.id)}
                      onChange={() => handleRowClick(index)}
                    />
                  </TableCell>
                  <TableCell>{group.groupName}</TableCell>
                  <TableCell>
                    <ButtonContainer>
                      <Tooltip title="Editar grupo" arrow>
                        <IconButton aria-label="editar" onClick={(e) => handleEditClick(e, index)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Tareas" arrow>
                        <IconButton aria-label="tareas" onClick={(e) => handleHomeworksClick(e, index)}>
                          <AutoAwesomeMotionIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Participantes" arrow>
                        <IconButton aria-label="estudiantes" onClick={(e) => handleStudentsClick(e, index)}>
                          <GroupsIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace de invitacion a estudiante" arrow>
                        <IconButton aria-label="enlace" onClick={(e) => handleLinkClick(e, index)}>
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace de invitacion a docente" arrow>
                        <IconButton aria-label="enlace" onClick={(e) => handleLinkClickTeacher(e, index)}>
                          <PiChalkboardTeacherFill />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar grupo" arrow>
                        <IconButton aria-label="eliminar" onClick={(e) => handleDeleteClick(e, index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ButtonContainer>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="groups-detail-cell" colSpan={2}>
                    <Collapse in={expandedRows.includes(index)} timeout="auto" unmountOnExit>
                      <div className="groups-detail-wrapper">
                        <div className="groups-detail-content">
                          Detalle del grupo: {groups[index].groupDetail}
                        </div>
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </StyledTable>
      </section>

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
          onClose={handleValidationDialogClose}
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
    </CenteredContainer>
  );
}

export default Groups;
