import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { IconifyIcon } from "../Shared/Components";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import CreateGroupPopup from "../Groups/components/GroupsForm";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../modules/Groups/application/GetGroups";
import DeleteGroup from "../../modules/Groups/application/DeleteGroup";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import { getCourseLink } from "../../modules/Groups/application/GetCourseLink";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import EditGroupPopup from "./components/EditGroupForm";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { typographyVariants } from "../../styles/typography";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const PageHeader = styled("div")({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
});

const HeaderActions = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "12px",
});

const GroupsList = styled("div")({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "26px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
});

const GroupCard = styled(Paper)({
  borderRadius: "10px",
  border: "1px solid #e7e7e7",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16)",
  padding: "16px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

// Estilos reutilizables para IconButton
const iconButtonSx = {
  transition: "all 0.175s ease-out",
  "&:hover": {
    filter: "brightness(0.9)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  "&:active": {
    transform: "scale(0.97)",
  },
};

// Normaliza cualquier id a number
const asId = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function Groups() {
  const navigate = useNavigate();

  // UI state
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [editGroupPopupOpen, setEditGroupPopupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupDataObject | null>(null);

  // data
  const [isLoading, setIsLoading] = useState(true);
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

    try {
      if (role === "teacher") {
        const ids = await getGroupsApp.getGroupsByUserId(uid);
        const allGroups = (await Promise.all(ids.map((id: number) => getGroupsApp.getGroupById(id))))
          .filter(Boolean) as GroupDataObject[];
          setGroups(allGroups);
      } else {
        const allGroups = await getGroupsApp.getGroups();
        setGroups(allGroups);
      }
    } finally {
      setIsLoading(false);
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
    const clickedGroup = groups[index];
    if (!clickedGroup?.id) return;

    setSelectedRow(index);
    selectAndSync(clickedGroup.id);
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

  const handleStudentLinkClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const id = asId(groups[index]?.id);
    if (id) getCourseLink(id, "student");
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedRow(index);
    setConfirmationOpen(true);
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

  if (isLoading) return <FullScreenLoader variant="page" />;

  return (
    <CenteredContainer>
      <section className="Grupos">
        <PageHeader>
          <Typography sx={{ ...typographyVariants.h3, color: "#171717" }}>
            Grupos
          </Typography>
          <HeaderActions>
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleGroupsOrder}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconifyIcon icon="mdi:plus" width={20} height={20} color="white" hoverColor="#e0e0e0" />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                ...typographyVariants.paragraphMedium,
                minWidth: "112px",
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
              }}
              onClick={handleCreateGroupClick}
            >
              Crear
            </Button>
          </HeaderActions>
        </PageHeader>

        <Divider sx={{ width: "82%", margin: "0 auto", mt: 1.5, borderColor: "#BDBDBD" }} />

        <GroupsList>
          {groups.map((group, index) => (
            <GroupCard
              key={asId(group.id) || index}
              onClick={() => handleRowClick(index)}
              sx={{
                backgroundColor:
                  selectedRow === index || asId(currentSelectedGroupId) === asId(group.id)
                    ? "#dfe8f2"
                    : "#ffffff",
              }}
            >
              <Typography sx={{ ...typographyVariants.paragraphBig, color: "#202124" }}>
                {group.groupName}
              </Typography>

              <ButtonContainer>
                <Tooltip title="Editar grupo" arrow>
                  <IconButton
                    aria-label="editar"
                    onClick={(e) => handleEditClick(e, index)}
                    sx={iconButtonSx}
                  >
                    <IconifyIcon icon="mdi:file-document-multiple-outline" color="#7d7d7d" hoverColor="#616161" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Copiar enlace de invitacion a estudiante" arrow>
                  <IconButton
                    aria-label="enlace"
                    onClick={(e) => handleStudentLinkClick(e, index)}
                    sx={iconButtonSx}
                  >
                    <IconifyIcon icon="mdi:link-variant" color="#7d7d7d" hoverColor="#616161" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Participantes" arrow>
                  <IconButton
                    aria-label="estudiantes"
                    onClick={(e) => handleStudentsClick(e, index)}
                    sx={iconButtonSx}
                  >
                    <IconifyIcon icon="mdi:account-group" color="#7d7d7d" hoverColor="#616161" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar grupo" arrow>
                  <IconButton aria-label="eliminar" onClick={(e) => handleDeleteClick(e, index)}>
                    <IconifyIcon icon="mdi:trash-can" color="#7d7d7d" hoverColor="#616161" />
                  </IconButton>
                </Tooltip>
              </ButtonContainer>
            </GroupCard>
          ))}
        </GroupsList>
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
