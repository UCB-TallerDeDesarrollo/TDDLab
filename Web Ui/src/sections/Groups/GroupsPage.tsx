import React, { useState, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import CreateGroupPopup from "../Groups/components/GroupsForm";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Menu,
  MenuItem,
} from "@mui/material";

import { CenteredContainer } from "./components/WrappedStyledComponents";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";
import { useGroups, asId } from "./hooks/useGroups";
import { useGroupSelection } from "./hooks/useGroupSelection";
import { 
  GenericListContainer, 
  GenericListHeader, 
  GenericListBody, 
  GenericCard 
} from "../Shared/Components/GenericList";


function Groups() {
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const userRepository = useMemo(() => new UsersRepository(), []);
  const getUsersByGroupId = useMemo(() => new GetUsersByGroupId(userRepository), [userRepository]);
  const [authData, setAuthData] = useGlobalState("authData");

  const { groups, setGroups, groupRepository, handleGroupsOrder, handleGroupUpdated } = useGroups(authData);
  const { currentSelectedGroupId, selectAndSync, clearSelection } = useGroupSelection(groups, authData, setAuthData);

  const handleCreateGroupClick = () => {
    setCreateGroupPopupOpen(true);
  };

  const handleCheckboxChange = (index: number) => {
    const clickedGroup = groups[index];
    if (!clickedGroup?.id) return;
    selectAndSync(clickedGroup.id);
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
        <GenericListContainer>
          <GenericListHeader
            title="Grupos"
            actions={
              <>
                <Button
                  variant="outlined"
                  className="groups-filter-btn"
                  endIcon={<FilterListIcon />}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  Filtrar
                </Button>
                <Menu
                  anchorEl={filterAnchor}
                  open={Boolean(filterAnchor)}
                  onClose={() => setFilterAnchor(null)}
                >
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "A_Up_Order" } }); setFilterAnchor(null); }}>
                    Orden alfabetico ascendente
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "A_Down_Order" } }); setFilterAnchor(null); }}>
                    Orden alfabetico descendente
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "Time_Up" } }); setFilterAnchor(null); }}>
                    Recientes
                  </MenuItem>
                  <MenuItem onClick={() => { handleGroupsOrder({ target: { value: "Time_Down" } }); setFilterAnchor(null); }}>
                    Antiguos
                  </MenuItem>
                </Menu>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  className="groups-create-btn"
                  onClick={handleCreateGroupClick}
                >
                  Crear
                </Button>
              </>
            }
          />
          <GenericListBody>
            {groups.map((group, index) => (
              <GenericCard
                key={asId(group.id) || index}
                showCheckbox={true}
                isSelected={asId(currentSelectedGroupId) === asId(group.id)}
                onSelectionChange={() => handleCheckboxChange(index)}
                title={group.groupName}
                onClick={() => handleRowClick(index)}
                isExpanded={expandedRows.includes(index)}
                details={<>Detalle del grupo: {group.groupDetail}</>}
                actions={
                  <>
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
                    <Tooltip title="Copiar enlace de invitacion" arrow>
                      <IconButton aria-label="enlace" onClick={(e) => handleLinkClick(e, index)}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Participantes" arrow>
                      <IconButton aria-label="estudiantes" onClick={(e) => handleStudentsClick(e, index)}>
                        <GroupsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar grupo" arrow>
                      <IconButton aria-label="eliminar" onClick={(e) => handleDeleteClick(e, index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
            ))}
          </GenericListBody>
        </GenericListContainer>
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
