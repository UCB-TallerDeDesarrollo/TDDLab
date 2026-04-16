import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import Checkbox from "@mui/material/Checkbox";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import CreateGroupPopup from "../Groups/components/GroupsForm";
import EditGroupPopup from "./components/EditGroupForm";

import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";

import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";

import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";

import "../../App.css";
import { AppIcon } from "../../sections/Shared/Components/AppIcon"; // O la ruta que elijas
import { APP_ICONS } from "../../utils/IconLibrary";

const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

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

  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [currentSelectedGroupId, setCurrentSelectedGroupId] =
    useState<number>(0);

  const groupRepository = new GroupsRepository();
  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  const selectAndSync = (rawId: unknown) => {
    const id = asId(rawId);
    if (!id) return;

    setCurrentSelectedGroupId(id);
    localStorage.setItem("selectedGroup", String(id));

    if (asId(authData?.usergroupid) !== id) {
      setAuthData({ ...authData, usergroupid: id });
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroupsApp = new GetGroups(groupRepository);
      const role = authData?.userRole ?? "";
      const uid = authData?.userid ?? -1;

      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (
          await Promise.all(
            ids.map((id: number) => getGroupsApp.getGroupById(id))
          )
        ).filter(Boolean) as GroupDataObject[];
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

    const fromURL = asId(
      new URLSearchParams(window.location.search).get("groupId")
    );
    if (fromURL) {
      selectAndSync(fromURL);
      return;
    }

    const fromLS = asId(localStorage.getItem("selectedGroup"));
    if (fromLS) {
      selectAndSync(fromLS);
      return;
    }

    const fromAuth = asId(authData?.usergroupid);
    if (fromAuth) {
      selectAndSync(fromAuth);
      return;
    }

    (async () => {
      try {
        const getGroupsApp = new GetGroups(groupRepository);
        const uid = asId(authData?.userid);

        if (uid) {
          const ids = await getGroupsApp.getGroupsByUserId(uid);
          const first = asId(ids?.[0]);
          if (first) {
            selectAndSync(first);
            return;
          }
        }
      } catch {
        // ignore
      }

      const firstVisible = asId(groups[0]?.id);
      if (firstVisible) {
        selectAndSync(firstVisible);
      }
    })();
  }, [
    groups,
    currentSelectedGroupId,
    authData?.usergroupid,
    authData?.userid,
  ]);

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    const sorting = event.target.value;
    setSelectedSorting(sorting);

    const sorted = [...groups];

    if (sorting === "A_Up_Order") {
      sorted.sort((a, b) => a.groupName.localeCompare(b.groupName));
    } else if (sorting === "A_Down_Order") {
      sorted.sort((a, b) => b.groupName.localeCompare(a.groupName));
    } else if (sorting === "Time_Up") {
      sorted.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
    } else if (sorting === "Time_Down") {
      sorted.sort(
        (a, b) =>
          new Date(a.creationDate).getTime() -
          new Date(b.creationDate).getTime()
      );
    }

    setGroups(sorted);
  };

  const handleRowClick = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((r) => r !== index) : [index]
    );

    const clickedGroup = groups[index];
    if (!clickedGroup?.id) return;

    setSelectedRow(index);
    selectAndSync(clickedGroup.id);
  };

  const handleCreateGroupClick = () => {
    setCreateGroupPopupOpen(true);
  };

  const handleEditClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const group = groups[index];
    if (!group) return;

    setGroupToEdit(group);
    setEditGroupPopupOpen(true);
  };

  const handleHomeworksClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const clickedGroup = groups[index];
    if (clickedGroup?.id) {
      navigate(`/?groupId=${clickedGroup.id}`);
    }
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
    if (id) {
      getCourseLink(id, "student");
    }
  };

  const handleLinkClickTeacher = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) {
      getCourseLink(id, "teacher");
    }
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
            if (next) {
              selectAndSync(next);
            } else {
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
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  const isRowSelected = (index: number) =>
    index === selectedRow || index === hoveredRow;

  return (
    <div className="centered-container">
      <div className="page-header">
        <h2 className="section-title">Grupos</h2>
        <div className="filter-container">
          <SortingComponent
            selectedSorting={selectedSorting}
            onChangeHandler={handleGroupsOrder}
          />
          <Button
            className="btn-std btn-primary"
            startIcon={<AppIcon icon={APP_ICONS.PLUS} size={20} />}
            onClick={handleCreateGroupClick}
          >
            Crear
          </Button>
        </div>
      </div>

      <section className="table-container-full">
        <Table className="styled-table">
          <TableBody>
            {groups.map((group, index) => (
              <React.Fragment key={asId(group.id) || index}>
                <TableRow
                  className="table-row-bordered"
                  selected={isRowSelected(index)}
                  onClick={() => handleRowClick(index)}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell padding="checkbox" width="50px">
                    <Checkbox
                      checked={asId(currentSelectedGroupId) === asId(group.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleRowClick(index)}
                    />
                  </TableCell>

                  <TableCell className="practice-title-cell">
                    {group.groupName}
                  </TableCell>

                  <TableCell align="right">
                    <div className="action-buttons-group">
                      <Tooltip title="Editar grupo" arrow>
                        <IconButton onClick={(e) => handleEditClick(e, index)}>
                          <AppIcon icon={APP_ICONS.EDIT} className="icon-gray" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Tareas" arrow>
                        <IconButton onClick={(e) => handleHomeworksClick(e, index)}>
                          <AppIcon icon={APP_ICONS.TASKS} className="icon-gray" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Participantes" arrow>
                        <IconButton onClick={(e) => handleStudentsClick(e, index)}>
                          <AppIcon icon={APP_ICONS.GROUPS} className="icon-gray" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace estudiante" arrow>
                        <IconButton onClick={(e) => handleLinkClick(e, index)}>
                          <AppIcon icon={APP_ICONS.LINK} className="icon-gray" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace docente" arrow>
                        <IconButton onClick={(e) => handleLinkClickTeacher(e, index)}>
                          <AppIcon icon={APP_ICONS.TEACHER} className="icon-gray" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar grupo" arrow>
                        <IconButton onClick={(e) => handleDeleteClick(e, index)}>
                          <AppIcon icon={APP_ICONS.DELETE} className="icon-gray" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={3} style={{ padding: 0 }}>
                    <Collapse in={expandedRows.includes(index)} timeout="auto" unmountOnExit>
                      <div className="group-detail-box" style={{ padding: '15px', background: '#f9f9f9', borderBottom: '1px solid #e7e7e7', fontSize: '14px' }}>
                        <strong>Detalle:</strong> {group.groupDetail || "Sin descripción disponible."}
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* ... Diálogos se mantienen igual ... */}
      <ConfirmationDialog
        open={confirmationOpen}
        title="¿Eliminar el grupo?"
        content="Ten en cuenta que esta acción también eliminará todas las tareas asociadas."
        cancelText="Cancelar"
        deleteText="Eliminar"
        onCancel={() => setConfirmationOpen(false)}
        onDelete={handleConfirmDelete}
      />
      <ValidationDialog
        open={validationDialogOpen}
        title="Grupo eliminado exitosamente"
        closeText="Cerrar"
        onClose={() => setValidationDialogOpen(false)}
      />
      <CreateGroupPopup open={createGroupPopupOpen} handleClose={() => setCreateGroupPopupOpen(false)} onCreated={handleGroupCreated} />
      <EditGroupPopup open={editGroupPopupOpen} handleClose={() => setEditGroupPopupOpen(false)} groupToEdit={groupToEdit} onUpdated={handleGroupUpdated} />
    </div>
  );
}

export default Groups;