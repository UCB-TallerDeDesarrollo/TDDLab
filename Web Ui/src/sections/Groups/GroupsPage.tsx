import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import {
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PiChalkboardTeacherFill } from "react-icons/pi";

import { AppIcon } from "../../sections/Shared/Components/AppIcon";
import { APP_ICONS } from "../../utils/IconLibrary";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
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

    const firstVisible = asId(groups[0]?.id);
    if (firstVisible) {
      selectAndSync(firstVisible);
    }
  }, [groups, currentSelectedGroupId, authData?.usergroupid]);

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

  const filteredGroups = groups.filter((group) =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (index: number) => {
    const clickedGroup = filteredGroups[index];
    if (!clickedGroup?.id) return;

    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((r) => r !== index) : [index]
    );

    setSelectedRow(index);
    selectAndSync(clickedGroup.id);
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    index: number
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRowClick(index);
    }
  };

  const handleCreateGroupClick = () => {
    setCreateGroupPopupOpen(true);
  };

  const handleEditClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();

    const group = filteredGroups[index];
    if (!group) return;

    setGroupToEdit(group);
    setEditGroupPopupOpen(true);
  };

  const handleHomeworksClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();

    const clickedGroup = filteredGroups[index];
    if (clickedGroup?.id) {
      navigate(`/?groupId=${clickedGroup.id}`);
    }
  };

  const handleStudentsClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();

    const groupid = asId(filteredGroups[index]?.id);
    if (!groupid) return;

    try {
      await getUsersByGroupId.execute(groupid);
      navigate(`/users/group/${groupid}`);
    } catch {
      // handled
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

    const id = asId(filteredGroups[index]?.id);
    if (id) {
      getCourseLink(id, "student");
    }
  };

  const handleLinkClickTeacher = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();

    const id = asId(filteredGroups[index]?.id);
    if (id) {
      getCourseLink(id, "teacher");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedRow !== null) {
        const itemFound = filteredGroups[selectedRow];

        if (itemFound) {
          const deleteGroup = new DeleteGroup(groupRepository);
          await deleteGroup.deleteGroup(asId(itemFound.id) || 0);

          setValidationDialogOpen(true);

          const copy = groups.filter((g) => asId(g.id) !== asId(itemFound.id));
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
    } catch {
      // handled
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
    index === selectedRow ||
    index === hoveredRow ||
    asId(currentSelectedGroupId) === asId(filteredGroups[index]?.id);

  return (
    <div className="page-container">
      <section className="page-content">
        <div className="page-top-line" />

        <div className="page-header">
          <div className="page-title">
            <span>Grupos</span>
            <span className="page-title-arrow">⌵</span>
          </div>

          <div className="page-title-line" />

          <div className="page-search">
            <span>Buscar</span>
            <input
              type="text"
              aria-label="Buscar grupo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AppIcon icon={APP_ICONS.SEARCH} size={16} />
          </div>
        </div>

        <div className="page-toolbar">
          <Button
            className="groups-create-button"
            startIcon={<AppIcon icon={APP_ICONS.PLUS} size={16} />}
            onClick={handleCreateGroupClick}
          >
            Crear
          </Button>

          <div className="page-filter-actions">
            <Button className="page-filter-button">Todos</Button>
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleGroupsOrder}
            />
          </div>
        </div>

        <section className="table-container-full">
          <Table className="styled-table">
            <TableBody>
              {filteredGroups.map((group, index) => (
                <React.Fragment key={asId(group.id) || index}>
                  <TableRow
                    className="table-row-bordered"
                    selected={isRowSelected(index)}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(index)}
                    onKeyDown={(event) => handleRowKeyDown(event, index)}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={asId(currentSelectedGroupId) === asId(group.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => handleRowClick(index)}
                      />
                    </TableCell>

                    <TableCell className="practice-title-cell">
                      {group.groupName}
                    </TableCell>

                    <TableCell align="right">
                      <div className="action-buttons-group">
                        <Tooltip title="Editar grupo" arrow>
                          <IconButton
                            aria-label="editar"
                            onClick={(event) => handleEditClick(event, index)}
                          >
                            <AppIcon icon={APP_ICONS.EDIT} className="icon-gray" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Tareas" arrow>
                          <IconButton
                            aria-label="tareas"
                            onClick={(event) =>
                              handleHomeworksClick(event, index)
                            }
                          >
                            <AppIcon
                              icon={APP_ICONS.TASKS}
                              className="icon-gray"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Participantes" arrow>
                          <IconButton
                            aria-label="estudiantes"
                            onClick={(event) =>
                              handleStudentsClick(event, index)
                            }
                          >
                            <AppIcon
                              icon={APP_ICONS.GROUPS}
                              className="icon-gray"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title="Copiar enlace de invitacion a estudiante"
                          arrow
                        >
                          <IconButton
                            aria-label="enlace-estudiante"
                            onClick={(event) => handleLinkClick(event, index)}
                          >
                            <AppIcon
                              icon={APP_ICONS.LINK}
                              className="icon-gray"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title="Copiar enlace de invitacion a docente"
                          arrow
                        >
                          <IconButton
                            aria-label="enlace-docente"
                            onClick={(event) =>
                              handleLinkClickTeacher(event, index)
                            }
                          >
                            <PiChalkboardTeacherFill />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar grupo" arrow>
                          <IconButton
                            aria-label="eliminar"
                            onClick={(event) => handleDeleteClick(event, index)}
                          >
                            <AppIcon
                              icon={APP_ICONS.DELETE}
                              className="icon-gray"
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={3} style={{ padding: 0 }}>
                      <Collapse
                        in={expandedRows.includes(index)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <div className="group-detail-box">
                          <strong>Detalle del grupo:</strong>{" "}
                          {group.groupDetail || "Sin descripción disponible."}
                        </div>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </section>
      </section>

      {confirmationOpen && (
        <ConfirmationDialog
          open={confirmationOpen}
          title="¿Eliminar el grupo?"
          content={
            <>
              Ten en cuenta que esta acción también eliminará <br />
              todas las tareas asociadas.
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
        existingGroups={groups}
        onCreated={handleGroupCreated}
      />

      <EditGroupPopup
        open={editGroupPopupOpen}
        handleClose={() => setEditGroupPopupOpen(false)}
        existingGroups={groups}
        groupToEdit={groupToEdit}
        onUpdated={handleGroupUpdated}
      />
    </div>
  );
}

export default Groups;