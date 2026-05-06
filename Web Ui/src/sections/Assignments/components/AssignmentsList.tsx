import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  Container, 
  Button, 
  Grid, 
  Divider,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { FullScreenLoader } from "../../../components/FullScreenLoader";
import { AssignmentSkeleton } from "../../../components/Skeleton";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

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
import { typographyVariants } from "../../../styles/typography";
import AssignmentDetailModal from "./AssignmentDetailModal";






interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
  userGroupid: number | number[];
  userid: number;
  onGroupChange: (groupId: number) => void;
}

function Assignments({
  ShowForm: showForm,
  userRole,
  userGroupid,
  userid,
  onGroupChange,
}: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setDeleteLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const location = useLocation();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();

  const deleteAssignmentUseCase = new DeleteAssignment(assignmentsRepository);

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
    if (userRole === "student") {
      if (localStorage.getItem('userGroups') === null) {
        const studentGroups = userGroupid
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        if (Array.isArray(studentGroups)) {
          allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
        }
        else {
          allGroups = await Promise.all([getGroups.getGroupById(studentGroups)]);
        }
      } else if (localStorage.getItem('userGroups') === "[0]") { // Si el usuario se registro en un nuevo grupo
        const studentGroups = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
      }
      else {
        const studentGroups: number[] = JSON.parse(localStorage.getItem('userGroups') ?? '[]');
        allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
      }
    } else if (userRole === "teacher") {
      const teacherGroupIds = await getGroups.getGroupsByUserId(authData.userid ?? -1);
      allGroups = await Promise.all(teacherGroupIds.map((id) => getGroups.getGroupById(id)));
    } else if (userRole === "admin") {
      allGroups = await getGroups.getGroups();
    }

    if (selectedGroup === 0 && allGroups.length > 0 && !isLoading) {
      await loadAssignmentsByGroupId(allGroups[0].id);
    }

    setIsLoading(false);
    return allGroups;
  }

  const fetchData = async () => {
    try {
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      const groupIdFromURL = new URLSearchParams(globalThis.location.search).get("groupId");
      const groupIdUrl = groupIdFromURL ? Number(groupIdFromURL) : null;

      const savedSelectedGroup = localStorage.getItem("selectedGroup");
      const groupIdLocal = savedSelectedGroup ? Number(savedSelectedGroup) : null;
      const groupIdAuth = authData?.usergroupid ?? null;

      let firstUserGroup: number | null = null;
      try {
        const storedUserGroups = JSON.parse(localStorage.getItem("userGroups") || "[]");
        if (Array.isArray(storedUserGroups) && storedUserGroups.length > 0) {
          firstUserGroup = storedUserGroups[0];
        }
      } catch { }

      const finalGroupId =
        groupIdUrl ||
        groupIdLocal ||
        groupIdAuth ||
        firstUserGroup ||
        allGroups?.[0]?.id ||
        null;

      if (finalGroupId) {
        await loadAssignmentsByGroupId(finalGroupId);
      } else {
        setSelectedGroup(0);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error en fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location]);

  // Refrescar lista si alguna edición avisa globalmente
  useEffect(() => {
    const handler = () => {
      const savedSelectedGroup = localStorage.getItem("selectedGroup");
      const groupId = savedSelectedGroup ? Number(savedSelectedGroup) : selectedGroup;
      if (groupId) {
        loadAssignmentsByGroupId(groupId);
      }
    };
    globalThis.addEventListener('assignment-updated', handler as EventListener);
    return () => globalThis.removeEventListener('assignment-updated', handler as EventListener);
  }, [selectedGroup]);

  useEffect(() => {
    const fetchAssignmentsByGroup = async () => {
      try {
        // Preferir grupo seleccionado guardado
        const savedSelectedGroup = localStorage.getItem("selectedGroup");
        const preferredGroupId = savedSelectedGroup
          ? parseInt(savedSelectedGroup, 10)
          : authData?.usergroupid;

        if (preferredGroupId === undefined || preferredGroupId === null) {
          return;
        }

        const data = await assignmentsRepository.getAssignmentsByGroupid(preferredGroupId);
        setSelectedGroup(preferredGroupId);
        setAssignments(data);
        orderAssignments([...data], selectedSorting);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignmentsByGroup();
  }, [authData, selectedSorting]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  const loadAssignmentsByGroupId = async (groupId: number) => {
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

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const groupId = event.target.value as number;
    await loadAssignmentsByGroupId(groupId);
  };

  const filteredAssignments = selectedGroup
    ? assignments.filter((assignment) => assignment.groupid === selectedGroup)
    : assignments;

  const handleClickDetail = (index: number) => {
    const assignmentId = filteredAssignments[index].id;
    setSelectedAssignmentId(assignmentId);
    setDetailModalOpen(true);
  };

  const handleClickDelete = (index: number) => {
    const assignmentToDelete = filteredAssignments[index];
    const originalIndex = assignments.indexOf(assignmentToDelete);
    setSelectedAssignmentIndex(originalIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAssignmentIndex === null || !assignments[selectedAssignmentIndex]) {
      setConfirmationOpen(false);
      return;
    }

    setDeleteLoading(true);

    try {
      const assignmentToDelete = assignments[selectedAssignmentIndex];
      console.log('Eliminando assignment:', assignmentToDelete);

      const resutlt = await deleteAssignmentUseCase.deleteAssignment(assignmentToDelete.id);
      console.log('Resultado obtenido al intentar eliminar eliminar:', resutlt);

      setValidationDialogOpen(true);

    } catch (error: any) {
      console.error('Error eliminando assignment:', error);
    } finally {
      setConfirmationOpen(false);
      setDeleteLoading(false);
      setSelectedAssignmentIndex(null);
    }
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

return (
  <Container sx={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
    {isLoading ? (
      <FullScreenLoader variant="page" />
    ) : (
      <section className="Tareas">
        <Box sx={{ width: { xs: '95%', sm: '90%', md: '92%' }, ml: { xs: 'auto', md: '40px' }, mr: { xs: 'auto', md: 0 }, mt: 2 }}>
          
          {/* Header & Title */}
          <Box sx={{ pb: 2 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              mb: 1,
              gap: { xs: '16px', sm: '0' }
            }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                Tareas
              </Typography>

              {/* Filters and Controls */}
              <Box sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", sm: "flex-end" },
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                width: { xs: "100%", sm: "auto" }
              }}>
                <GroupFilter
                  selectedGroup={selectedGroup}
                  groupList={groupList}
                  onChangeHandler={handleGroupChange}
                  defaultName={
                    groupList.find((group) => group.id == selectedGroup)?.groupName ||
                    groupList[0]?.groupName ||
                    "Selecciona un grupo"
                  }
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
                      ...typographyVariants.paragraphMedium,
                      paddingX: "16px",
                      paddingY: "8px",
                      minWidth: "90px",
                      whiteSpace: "nowrap",
                      transition: "all 0.175s ease-out",
                      "&:hover": {
                        filter: "brightness(0.9)",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
                      },
                      "&:active": { transform: "scale(0.97)" },
                    }}
                    onClick={showForm}
                  >
                    Crear
                  </Button>
                )}
              </Box>
            </Box>
            <Divider sx={{ width: '100%', mb: 2, mt: 1, borderColor: '#D9D9D9' }} />
          </Box>

          {/* Assignments List (Responsive Cards) */}
          <Grid container spacing={2}>
            {filteredAssignments.map((assignment, index) => (
              <Grid item xs={12} key={assignment.id}>
                <Assignment
                  assignment={assignment}
                  index={index}
                  handleClickDetail={handleClickDetail}
                  handleClickDelete={handleClickDelete}
                  handleRowHover={handleRowHover}
                  role={userRole}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Dialogs/Modals (Keeping the logic from the second branch) */}
        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la tarea?"
            content={<>Ten en cuenta que esta acción también eliminará <br /> todas las entregas asociadas.</>}
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
            onClose={() => {
              setValidationDialogOpen(false);
              if (selectedGroup) {
                loadAssignmentsByGroupId(selectedGroup);
              } else if (authData?.usergroupid) {
                loadAssignmentsByGroupId(authData.usergroupid);
              }
            }}
          />
        )}
      </section>
    )}
  </Container>
);
              }}
            />
          )}

          {selectedAssignmentId !== null && (
            <AssignmentDetailModal
              open={detailModalOpen}
              assignmentId={selectedAssignmentId}
              role={userRole}
              userid={userid}
              onClose={() => {
                setDetailModalOpen(false);
                setSelectedAssignmentId(null);
              }}
            />
          )}
        </section>
      )}
    </Container>
  );
}

export default Assignments;