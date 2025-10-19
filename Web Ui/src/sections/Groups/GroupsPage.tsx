import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
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
import { adaptarDatos } from "../../utils/adaptarDatos";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import { UpdateUser } from "../../modules/Users/application/updateUser";

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

function Groups() {
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const groupRepository = new GroupsRepository();
  let [selectedGroup] = useState<number | null>(null);

  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      const allGroups = await getGroups.getGroups();
      console.log(selectedGroup);
      setGroups(allGroups);
    };
    const savedSelectedGroup = authData?.usergroupid ?? 67; // Asegúrate de que esto no sea null
    selectedGroup = savedSelectedGroup;
    fetchGroups();
  }, [authData]);

  const handleCreateGroupClick = () => {
    setCreateGroupPopupOpen(true);
  };

  const handleGroupsOrder = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    const selectedSortingLocal = event.target.value as keyof typeof sortings;

    const sortings = {
      A_Up_Order: () =>
        [...groups].sort((a, b) => a.groupName.localeCompare(b.groupName)),
      A_Down_Order: () =>
        [...groups].sort((a, b) => b.groupName.localeCompare(a.groupName)),
      Time_Up: () =>
        [...groups].sort(
          (a, b) =>
            new Date(a.creationDate).getTime() -
            new Date(b.creationDate).getTime()
        ),
      Time_Down: () =>
        [...groups].sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime()
        ),
    };
    console.log(typeof groups[0].creationDate);

    const sortedGroups = sortings[selectedSortingLocal]();
    setGroups(sortedGroups);
  };
  const handleUpdateUser = async (
    updatedUser: UserDataObject
  ) => {
    const userRepository = new UsersRepository();
    const submitUser = new UpdateUser(userRepository);

    try {
      await submitUser.updateUser(
        updatedUser.id,
        updatedUser.groupid
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleRowClick = async(index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((row) => row !== index));
    } else {
      setExpandedRows([index]);
    }

    const clickedGroup = groups.find((_group, i) => i === index);
    if (clickedGroup && clickedGroup.id !== undefined) {
      selectedGroup = clickedGroup.id;
      const uptdatedAuthData = { ...authData, usergroupid: clickedGroup.id };
      
      setAuthData(uptdatedAuthData);
      
      const datosParaGuardar = adaptarDatos(uptdatedAuthData);
        await handleUpdateUser(datosParaGuardar);
    }
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  const isRowSelected = (index: number) => {
    return index === selectedRow || index === hoveredRow;
  };

  const handleHomeworksClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const clickedGroup = groups[index];
    console.log("Boton de Tareas Iniciado");
    if (clickedGroup) {
      try {
        // Navegacion con el grupo seleccionado temporalmente en la URL
        const groupId = clickedGroup.id;
        console.log("El click de Group: ", groupId);
        navigate(`/?groupId=${groupId}`);
      } catch (error) {
        console.error("Hay un problema en el botón de Tareas", error);
      }
    }
  };


  const handleStudentsClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const groupid = groups[index].id;
    if (groupid) {
      try {
        const usersBygroup = await getUsersByGroupId.execute(groupid);
        console.log(usersBygroup);
        navigate(`/users/group/${groupid}`);
      } catch (error) {
        console.error("Failed to fetch users for group:", error);
      }
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
    const group = groups[index];
    if (group.id) {
      getCourseLink(group.id, "student");
    }
  };

  const handleLinkClickTeacher = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    const group = groups[index];
    if (group.id) {
      getCourseLink(group.id, "teacher");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedRow !== null) {
        const itemFound = groups[selectedRow];
        if (itemFound) {
          const deleteGroup = new DeleteGroup(groupRepository);
          await deleteGroup.deleteGroup(itemFound.id || 0);
          setValidationDialogOpen(true);
          delete groups[selectedRow];
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

  return (
    <CenteredContainer>
      <section className="Grupos">
        <StyledTable>
          <TableHead>
            <TableRow
              sx={{
                borderBottom: "2px solid #E7E7E7",
              }}
            >
              <TableCell
                sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}
              >
                Grupos{" "}
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
                    sx={{
                      borderRadius: "17px",
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
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
              <React.Fragment key={group.id}>
                <TableRow
                  selected={isRowSelected(index)}
                  onClick={() => handleRowClick(index)}
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={() => handleRowHover(null)}
                >
                  <TableCell>
                    <Checkbox
                      checked={authData.usergroupid == group.id}
                      onChange={() => handleRowClick(index)}
                    />
                  </TableCell>
                  <TableCell>{group.groupName}</TableCell>
                  <TableCell>
                    <ButtonContainer>
                      <Tooltip title="Tareas" arrow>
                        <IconButton
                          aria-label="tareas"
                          onClick={(event) =>
                            handleHomeworksClick(event, index)
                          }
                        >
                          <AutoAwesomeMotionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Estudiantes" arrow>
                        <IconButton
                          aria-label="estudiantes"
                          onClick={(event) => handleStudentsClick(event, index)}
                        >
                          <GroupsIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace de invitacion a estudiante" arrow>
                        <IconButton
                          aria-label="enlace"
                          onClick={(event) => handleLinkClick(event, index)}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copiar enlace de invitacion a docente" arrow>
                        <IconButton
                          aria-label="enlace"
                          onClick={(event) => handleLinkClickTeacher(event, index)}
                        >
                          <PiChalkboardTeacherFill  />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar grupo" arrow>
                        <IconButton
                          aria-label="eliminar"
                          onClick={(event) => handleDeleteClick(event, index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ButtonContainer>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ width: "100%", padding: 0, margin: 0 }}
                    colSpan={2}
                  >
                    <Collapse
                      in={expandedRows.includes(index)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <div
                        style={{
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                          borderRadius: "2px",
                        }}
                      >
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
              Ten en cuenta que esta acción también eliminará <br /> todas las
              tareas asociadas.
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
      />
    </CenteredContainer>
  );
}

export default Groups;
