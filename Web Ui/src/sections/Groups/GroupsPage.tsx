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
  Container,
  Button,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/system";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});

// Normaliza cualquier id a number
const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function Groups() {
  const navigate = useNavigate();

  // UI state
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);

  // data
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");

  const groupRepository = new GroupsRepository();
  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  // id seleccionado (sincronizado con auth/localStorage)
  const [currentSelectedGroupId, setCurrentSelectedGroupId] = useState<number>(0);

  // Sincroniza selección en toda la app
  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;
    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));
    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  // Cargar 
  useEffect(() => {
  const fetchGroups = async () => {
    const getGroupsApp = new GetGroups(groupRepository);
    const role = authData?.userRole ?? "";
    const uid  = authData?.userid ?? -1;

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

  useEffect(() => {
    if (!groups.length || currentSelectedGroupId) return;

    const fromURL = asId(new URLSearchParams(window.location.search).get("groupId"));
    if (fromURL) return selectAndSync(fromURL);

    const fromLS = asId(localStorage.getItem("selectedGroup"));
    if (fromLS) return selectAndSync(fromLS);

    const fromAuth = asId(authData?.usergroupid);
    if (fromAuth) return selectAndSync(fromAuth);

    (async () => {
      try {
        const getGroupsApp = new GetGroups(groupRepository);
        const uid = asId(authData?.userid);
        if (uid) {
          const ids = await getGroupsApp.getGroupsByUserId(uid);
          const first = asId(ids?.[0]);
          if (first) return selectAndSync(first);
        }
      } catch { /* ignore */ }
      const firstVisible = asId(groups[0]?.id);
      if (firstVisible) selectAndSync(firstVisible);
    })();
  }, [groups, currentSelectedGroupId, authData?.usergroupid, authData?.userid]);

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

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    const sortings = {
      A_Up_Order: () =>
        [...groups].sort((a, b) => a.groupName.localeCompare(b.groupName)),
      A_Down_Order: () =>
        [...groups].sort((a, b) => b.groupName.localeCompare(a.groupName)),
      Time_Up: () =>
        [...groups].sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime()
        ),
      Time_Down: () =>
        [...groups].sort(
          (a, b) =>
            new Date(a.creationDate).getTime() -
            new Date(b.creationDate).getTime()
        ),
    } as const;

    const key = event.target.value as keyof typeof sortings;
    setGroups(sortings[key]());
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

  const handleHomeworksClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const clickedGroup = groups[index];
    if (clickedGroup?.id) navigate(`/?groupId=${clickedGroup.id}`);
  };

  const handleStudentsClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
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
            else {
              setCurrentSelectedGroupId(0);
              localStorage.removeItem("selectedGroup");
              setAuthData({ ...authData, usergroupid: 0 });
            }
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

  const handleGroupUpdated = (updatedGroup: GroupDataObject) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  return (
    <CenteredContainer>
      <section className="Grupos">
        <StyledTable>
          <TableHead>
            <TableRow sx={{ borderBottom: "2px solid #E7E7E7" }}>
              <TableCell sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}>
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
                    sx={{ borderRadius: "17px", textTransform: "none", fontSize: "0.95rem" }}
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
                  <TableCell style={{ width: "100%", padding: 0, margin: 0 }} colSpan={2}>
                    <Collapse in={expandedRows.includes(index)} timeout="auto" unmountOnExit>
                      <div style={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", borderRadius: "2px" }}>
                        <div style={{ padding: "50px", marginLeft: "-30px" }}>
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
