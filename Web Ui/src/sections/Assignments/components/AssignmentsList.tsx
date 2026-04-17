import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress, Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  SelectChangeEvent } from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

import { styled } from "@mui/system";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
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

import { AppIcon } from "../../../sections/Shared/Components/AppIcon"; // O la ruta que elijas
import { APP_ICONS } from "../../../utils/IconLibrary";
const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
  userGroupid: number | number[];
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
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();
  const deleteAssignmentUseCase = new DeleteAssignment(assignmentsRepository);

  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const groupRepository = new GroupsRepository();
  const getGroups = new GetGroups(groupRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  const orderAssignments = (assignmentsArray: AssignmentDataObject[], selectedSorting: string) => {
    if (assignmentsArray.length == 0) return;
    if (selectedSorting === "A_Up_Order") assignmentsArray.sort((a, b) => a.title.localeCompare(b.title));
    else if (selectedSorting === "A_Down_Order") assignmentsArray.sort((a, b) => b.title.localeCompare(a.title));
    else if (selectedSorting === "Time_Up") assignmentsArray.sort((a, b) => b.id - a.id);
    else if (selectedSorting === "Time_Down") assignmentsArray.sort((a, b) => a.id - b.id);
    setAssignments(assignmentsArray);
  };

  async function getUserGroups() {
    setIsLoading(true);
    let allGroups: GroupDataObject[] = [];
    if (userRole === "student") {
      if (localStorage.getItem('userGroups') === null) {
        const studentGroups = userGroupid;
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        if (Array.isArray(studentGroups)) {
          allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
        } else {
          allGroups = await Promise.all([getGroups.getGroupById(studentGroups)]);
        }
      } else if (localStorage.getItem('userGroups') === "[0]") {
        const studentGroups = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        allGroups = await Promise.all(studentGroups.map((group) => getGroups.getGroupById(group)));
      } else {
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
      setIsLoading(true); // Iniciamos carga
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      // Lógica de prioridad de grupo
      const savedGroup = localStorage.getItem("selectedGroup");
      const initialGroupId = Number(savedGroup) || authData?.usergroupid || allGroups[0]?.id || 0;

      if (initialGroupId) {
        // Cargamos los datos para ese grupo específicamente
        await loadAssignmentsByGroupId(initialGroupId);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error en fetchData:", error);
    } finally {
      // Nos aseguramos de apagar el loading para que el test no espere eternamente
      setIsLoading(false); 
    }
  };
  useEffect(() => { fetchData(); }, [location]);

  useEffect(() => {
    const handler = () => {
      const savedSelectedGroup = localStorage.getItem("selectedGroup");
      const groupId = savedSelectedGroup ? Number(savedSelectedGroup) : selectedGroup;
      if (groupId) loadAssignmentsByGroupId(groupId);
    };
    globalThis.addEventListener('assignment-updated', handler as EventListener);
    return () => globalThis.removeEventListener('assignment-updated', handler as EventListener);
  }, [selectedGroup]);

  useEffect(() => {
    const fetchAssignmentsByGroup = async () => {
      try {
        const savedSelectedGroup = localStorage.getItem("selectedGroup");
        const preferredGroupId = savedSelectedGroup ? parseInt(savedSelectedGroup, 10) : authData?.usergroupid;
        if (preferredGroupId === undefined || preferredGroupId === null) return;
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
    localStorage.setItem("selectedGroup", groupId.toString());
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

  const handleClickDetail = (index: number) => navigate(`/assignment/${filteredAssignments[index].id}`);

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
      console.log('Resultado obtenido al intentar eliminar:', resutlt);
      setValidationDialogOpen(true);
    } catch (error: any) {
      console.error('Error eliminando assignment:', error);
    } finally {
      setConfirmationOpen(false);
      setDeleteLoading(false);
      setSelectedAssignmentIndex(null);
    }
  };

  const handleRowHover = (index: number | null) => setHoveredRow(index);

  return (
    <div className="centered-container">
      {isLoading ? (
        <LoadingContainer>
          <div className="fullscreen-loading">
            <CircularProgress />
          </div>
        </LoadingContainer>
      ) : (
        <section className="table-container-full">
          <Table className="styled-table">
            <TableHead>
              <TableRow>
                <TableCell className="table-cell-header">
                  Tareas
                </TableCell>
                <TableCell>
                  <div className="filter-container">
                    <div className="sorting-container" style={{ display: 'flex', gap: '8px' }}>
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
                    </div>
                    
                    {userRole !== "student" && (
                      <Button
                        className="btn-std btn-primary"
                        startIcon={<AppIcon icon={APP_ICONS.PLUS} size={20} />}
                        onClick={showForm}
                      >
                        Crear
                      </Button>
                    )}
                  </div>
                </TableCell>
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
          </Table>

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
    </div>
  );
}

export default Assignments;