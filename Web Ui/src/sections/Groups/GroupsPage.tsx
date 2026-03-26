import React, { useState, useEffect } from "react";
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
import GetGroups from "../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Collapse,
} from "@mui/material";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";

// Importamos el CSS global
import "../../App.css";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function Groups() {
  const navigate = useNavigate();

  // Estados
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);

  const groupRepository = new GroupsRepository();
  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  // Lógica de sincronización
  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;
    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));
    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  // Cargar datos
  useEffect(() => {
    const fetchGroups = async () => {
      const getGroupsApp = new GetGroups(groupRepository);
      const role = authData?.userRole ?? "";
      const uid = authData?.userid ?? -1;

      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (await Promise.all(ids.map((id: number) => getGroupsApp.getGroupById(id))))
          .filter(Boolean) as GroupDataObject[];
        setGroups(allGroups);
      } else {
        const allGroups = await getGroupsApp.getGroups();
        setGroups(allGroups);
      }
    };
    fetchGroups();
  }, [authData?.userRole, authData?.userid]);

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    const sorting = event.target.value;
    setSelectedSorting(sorting);
    let sorted = [...groups];
    if (sorting === "A_Up_Order") sorted.sort((a, b) => a.groupName.localeCompare(b.groupName));
    else if (sorting === "A_Down_Order") sorted.sort((a, b) => b.groupName.localeCompare(a.groupName));
    else if (sorting === "Time_Up") sorted.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    else if (sorting === "Time_Down") sorted.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
    setGroups(sorted);
  };

  const handleRowClick = (index: number) => {
    setExpandedRows(prev => prev.includes(index) ? prev.filter(r => r !== index) : [index]);
    const clickedGroup = groups[index];
    if (clickedGroup?.id) {
      setSelectedRow(index);
      selectAndSync(clickedGroup.id);
    }
  };

  return (
    <div className="centered-container">
      <section className="table-container-full">
        <Table className="styled-table">
          <TableHead>
            {/* Cabecera igual a Practicas: Título a la izquierda, botones a la derecha */}
            <TableRow className="table-row-bordered">
              <TableCell className="table-cell-header">
                Grupos
              </TableCell>
              <TableCell align="right">
                <div className="filter-container">
                  <SortingComponent
                    selectedSorting={selectedSorting}
                    onChangeHandler={handleGroupsOrder}
                  />
                  <Button
                    variant="contained"
                    className="btn-std btn-primary"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateGroupPopupOpen(true)}
                  >
                    Crear
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.map((group, index) => (
              <React.Fragment key={group.id || index}>
                <TableRow
                  className="table-row-bordered"
                  selected={index === selectedRow || index === hoveredRow}
                  onClick={() => handleRowClick(index)}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={asId(currentSelectedGroupId) === asId(group.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="practice-title-cell">
                    {group.groupName}
                  </TableCell>
                  <TableCell align="right">
                    <div className="action-buttons-group">
                      <Tooltip title="Editar grupo" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); setGroupToEdit(group); setEditGroupPopupOpen(true); }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Tareas" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/?groupId=${group.id}`); }}>
                          <AutoAwesomeMotionIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Participantes" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/users/group/${group.id}`); }}>
                          <GroupsIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Invitación Estudiante" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); getCourseLink(group.id, "student"); }}>
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Invitación Docente" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); getCourseLink(group.id, "teacher"); }}>
                          <PiChalkboardTeacherFill />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar grupo" arrow>
                        <IconButton onClick={(e) => { e.stopPropagation(); setSelectedRow(index); setConfirmationOpen(true); }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Detalle expandible */}
                <TableRow>
                  <TableCell colSpan={3} style={{ padding: 0 }}>
                    <Collapse in={expandedRows.includes(index)} timeout="auto" unmountOnExit>
                      <div style={{ padding: "20px 50px", background: "#f9f9f9", borderBottom: "1px solid #E7E7E7" }}>
                        <strong>Detalle del grupo:</strong> {group.groupDetail || "Sin descripción disponible."}
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Diálogos */}
      {confirmationOpen && (
        <ConfirmationDialog
          open={confirmationOpen}
          title="¿Eliminar el grupo?"
          content={<>Ten en cuenta que esta acción también eliminará <br /> todas las tareas asociadas.</>}
          cancelText="Cancelar"
          deleteText="Eliminar"
          onCancel={() => setConfirmationOpen(false)}
          onDelete={() => {/* Lógica de eliminación */}}
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
        onCreated={(newG) => setGroups(prev => [newG, ...prev])}
      />

      <EditGroupPopup
        open={editGroupPopupOpen}
        handleClose={() => setEditGroupPopupOpen(false)}
        groupToEdit={groupToEdit}
        onUpdated={(upG) => setGroups(prev => prev.map(g => g.id === upG.id ? upG : g))}
      />
    </div>
  );
}

export default Groups;