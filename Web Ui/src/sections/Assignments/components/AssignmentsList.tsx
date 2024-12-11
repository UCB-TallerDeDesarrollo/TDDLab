import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Button,
  SelectChangeEvent,
} from "@mui/material";

import { styled } from "@mui/system";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AddIcon from "@mui/icons-material/Add";
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import Assignment from "./Assignment";
import SortingComponent from "../../GeneralPurposeComponents/SortingComponent";
import GroupFilter from "./GroupFilter";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});
const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const CustomTableCell1 = styled(TableCell)({
  width: "80%",
});

const CustomTableCell2 = styled(TableCell)({
  width: "10%",
});

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
  userGroupid: number;
  onGroupChange: (groupId: number) => void;
}

function Assignments({
                       ShowForm: showForm,
                       userRole,
                       userGroupid,
                       onGroupChange,
                     }: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<
      number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();
  const location = useLocation();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();

  const deleteAssignment = new DeleteAssignment(assignmentsRepository);

  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const groupRepository = new GroupsRepository();
  const getGroups = new GetGroups(groupRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  const orderAssignments = (
      assignmentsArray: AssignmentDataObject[],
      selectedSorting: string
  ) => {
    if (assignmentsArray.length == 0) {
      return;
    }
    if (selectedSorting === "A_Up_Order") {
      assignmentsArray.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSorting === "A_Down_Order") {
      assignmentsArray.sort((a, b) => b.title.localeCompare(a.title));
    } else if (selectedSorting === "Time_Up") {
      assignmentsArray.sort((a, b) => b.id - a.id);
    } else if (selectedSorting === "Time_Down") {
      assignmentsArray.sort((a, b) => a.id - b.id);
    }
    setAssignments(assignmentsArray);
  };

  async function getUserGroups() {
    setIsLoading(true);
    let allGroups: GroupDataObject[] = [];
    console.log("userGroupID" ,userGroupid)
    if (userRole === "student") {
      if (localStorage.getItem('userGroups') === null) {
        const studentGroups = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
      } else {
        const studentGroups: number[] = JSON.parse(localStorage.getItem('userGroups') ?? '[]');
        allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
      }
    } else if(userRole === "teacher" || userRole === "admin") {
      allGroups = await getGroups.getGroups();
    }

    if(selectedGroup === 0 && allGroups.length > 0) {
      localStorage.setItem("selectedGroup", allGroups[0]?.id.toString());
      setSelectedGroup(allGroups[0]?.id);
      onGroupChange(allGroups[0]?.id);
    }

    setIsLoading(false);
    return allGroups;
  }

  const fetchData = async () => {
    console.log("Fetching data...", authData);
    try {
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      // Recuperar el groupId de la URL
      const groupIdFromURL = new URLSearchParams(window.location.search).get('groupId');
      // Recuperar el groupId de authData
      const authGroupId = authData?.usergroupid;
      // Recuperar el groupId de localStorage
      const savedSelectedGroup = localStorage.getItem("selectedGroup");

      let groupIdToUse: number | null = null;
      if (groupIdFromURL) {
        groupIdToUse = parseInt(groupIdFromURL, 10);
      } else if (authGroupId) {
        groupIdToUse = authGroupId;
      } else if (savedSelectedGroup) {
        groupIdToUse = parseInt(savedSelectedGroup, 10);
      }

      if (groupIdToUse !== undefined && groupIdToUse !== null) {
        const selectedGroup = allGroups.find((group) => group.id === groupIdToUse);
        if (selectedGroup?.id) {
          setSelectedGroup(selectedGroup.id);
          const data = await assignmentsRepository.getAssignmentsByGroupid(selectedGroup.id);
          setAssignments(data);
          orderAssignments([...data], selectedSorting);
        }
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location, authData]);

  useEffect(() => {
    const fetchAssignmentsByGroup = async () => {
      try {
        if (!authData || authData.usergroupid === undefined) {
          console.warn("authData aún no está disponible. Esperando a que se cargue...");
          return;
        }

        const authGroupId = authData.usergroupid;

        if (authGroupId !== undefined && authGroupId !== null) {
          const data = await assignmentsRepository.getAssignmentsByGroupid(authGroupId);
          setAssignments(data);
          orderAssignments([...data], selectedSorting);

        } else {
          console.warn("No se encontró un groupId válido para utilizar.");
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    if (authData && authData.usergroupid !== undefined) {
      fetchAssignmentsByGroup();
    }
  }, [authData, selectedSorting]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const groupId = event.target.value as number;
    setSelectedGroup(groupId);
    onGroupChange(groupId);

    // Guardar en localStorage
    localStorage.setItem("selectedGroup", groupId.toString());

    // Actualizar y guardar en authData
    const updatedAuthData = { ...authData, usergroupid: groupId };
    setAuthData(updatedAuthData);

    try {
      const updatedGroupId = updatedAuthData.usergroupid;
      if (updatedGroupId !== undefined) {
        const assignments = await assignmentsRepository.getAssignmentsByGroupid(updatedGroupId);
        setAssignments(assignments);
      } else {
        const assignments = await assignmentsRepository.getAssignments();
        setAssignments(assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments by group ID:", error);
    }
  };

  const filteredAssignments = selectedGroup
      ? assignments.filter((assignment) => assignment.groupid === selectedGroup)
      : assignments;

  const handleClickDetail = (index: number) => {
    navigate(`/assignment/${filteredAssignments[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    const assignmentToDelete = filteredAssignments[index];
    const originalIndex = assignments.indexOf(assignmentToDelete);
    setSelectedAssignmentIndex(originalIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (
          selectedAssignmentIndex !== null &&
          assignments[selectedAssignmentIndex]
      ) {
        console.log(
            "ID de la tarea a eliminar:",
            assignments[selectedAssignmentIndex].id,
        );
        await deleteAssignment.deleteAssignment(
            assignments[selectedAssignmentIndex].id,
        );
        const updatedAssignments = [...assignments];
        updatedAssignments.splice(selectedAssignmentIndex, 1);
        setAssignments(updatedAssignments);
      }
      setConfirmationOpen(false);
    } catch (error) {
      console.error(error);
    }
    setValidationDialogOpen(true);
    setConfirmationOpen(false);
  };
  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  return (
      <Container>
        {isLoading ? ( // Muestra el spinner mientras se cargan los datos
            <LoadingContainer>
              <CircularProgress />
            </LoadingContainer>
        ) : (
            <section className="Tareas">
              <StyledTable>
                <TableHead>
                  <TableRow
                      sx={{
                        borderBottom: "2px solid #E7E7E7"
                      }}
                  >
                    <CustomTableCell1
                        sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}
                    >
                      Tareas
                    </CustomTableCell1>
                    <CustomTableCell2>
                      <ButtonContainer>
                        <GroupFilter
                            selectedGroup={selectedGroup}
                            groupList={groupList}
                            onChangeHandler={handleGroupChange}
                            defaultName={groupList.find(group => group.id == selectedGroup)?.groupName || groupList[0]?.groupName || "Selecciona un grupo"}
                        />
                        <SortingComponent
                            selectedSorting={selectedSorting}
                            onChangeHandler={handleOrderAssignments}
                        />
                        {userRole !== "student" && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                sx={{
                                  borderRadius: "17px",
                                  textTransform: "none",
                                  fontSize: "0.95rem",
                                }}
                                onClick={showForm}
                            >
                              Crear
                            </Button>
                        )}
                      </ButtonContainer>
                    </CustomTableCell2>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.map((assignment, index) => (
                      <Assignment
                          key={assignment.id}
                          assignment={assignment}
                          index={index}
                          handleClickDetail={handleClickDetail}
                          handleClickDelete={handleClickDelete}
                          handleRowHover={handleRowHover}
                          role={userRole}
                      />
                  ))}
                </TableBody>
              </StyledTable>
              {confirmationOpen && (
                  <ConfirmationDialog
                      open={confirmationOpen}
                      title="¿Eliminar la tarea?"
                      content={
                        <>
                          Ten en cuenta que esta acción tambien eliminará <br /> todas las
                          entregas asociadas.
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
                      title="Tarea eliminada exitosamente"
                      closeText="Cerrar"
                      onClose={() => window.location.reload()}
                  />
              )}
            </section>
        )}
      </Container>
  );
}

export default Assignments;