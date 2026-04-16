import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CircularProgress, 
  Table,
  TableBody,
  Button,
  SelectChangeEvent,
  TableRow,
  TableCell,
} from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();
  const deleteAssignmentUseCase = new DeleteAssignment(assignmentsRepository);

  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const groupRepository = new GroupsRepository();
  const getGroups = new GetGroups(groupRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  const orderAssignments = (assignmentsArray: AssignmentDataObject[], selectedSorting: string) => {
    if (assignmentsArray.length === 0) return;
    const sorted = [...assignmentsArray];
    if (selectedSorting === "A_Up_Order") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (selectedSorting === "A_Down_Order") sorted.sort((a, b) => b.title.localeCompare(a.title));
    else if (selectedSorting === "Time_Up") sorted.sort((a, b) => b.id - a.id);
    else if (selectedSorting === "Time_Down") sorted.sort((a, b) => a.id - b.id);
    setAssignments(sorted);
  };

  async function getUserGroups() {
    setIsLoading(true);
    let allGroups: GroupDataObject[] = [];
    if (userRole === "student") {
      const savedGroups = localStorage.getItem('userGroups');
      if (savedGroups === null || savedGroups === "[0]") {
        const studentGroups = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem('userGroups', JSON.stringify(studentGroups));
        allGroups = await Promise.all(studentGroups.map((id: number) => getGroups.getGroupById(id)));
      } else {
        const studentGroups: number[] = JSON.parse(savedGroups);
        allGroups = await Promise.all(studentGroups.map((id: number) => getGroups.getGroupById(id)));
      }
    } else if (userRole === "teacher") {
      const teacherGroupIds = await getGroups.getGroupsByUserId(authData.userid ?? -1);
      allGroups = await Promise.all(teacherGroupIds.map((id: number) => getGroups.getGroupById(id)));
    } else if (userRole === "admin") {
      allGroups = await getGroups.getGroups();
    }
    return allGroups;
  }

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      const savedGroup = localStorage.getItem("selectedGroup");
      const initialGroupId = Number(savedGroup) || authData?.usergroupid || allGroups[0]?.id || 0;

      if (initialGroupId) {
        await loadAssignmentsByGroupId(initialGroupId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [location]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  const loadAssignmentsByGroupId = async (groupId: number) => {
    setSelectedGroup(groupId);
    onGroupChange(groupId);
    localStorage.setItem("selectedGroup", groupId.toString());
    setAuthData({ ...authData, usergroupid: groupId });
    try {
      const data = await assignmentsRepository.getAssignmentsByGroupid(groupId);
      setAssignments(data);
      orderAssignments([...data], selectedSorting);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    await loadAssignmentsByGroupId(event.target.value as number);
  };

  const filteredAssignments = selectedGroup
    ? assignments.filter((a) => a.groupid === selectedGroup)
    : assignments;

  const handleClickDetail = (index: number) => navigate(`/assignment/${filteredAssignments[index].id}`);

  const handleClickDelete = (index: number) => {
    const originalIndex = assignments.indexOf(filteredAssignments[index]);
    setSelectedAssignmentIndex(originalIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAssignmentIndex !== null && assignments[selectedAssignmentIndex]) {
      try {
        await deleteAssignmentUseCase.deleteAssignment(assignments[selectedAssignmentIndex].id);
        setValidationDialogOpen(true);
      } catch (error) {
        console.error(error);
      } finally {
        setConfirmationOpen(false);
        setSelectedAssignmentIndex(null);
      }
    }
  };

  if (isLoading) {
    return <div className="fullscreen-loading"><CircularProgress size={60} thickness={5} /></div>;
  }

  return (
    <div className="centered-container">
      <div className="page-header">
        <h2 className="section-title">Tareas</h2>
        
        <div className="filter-container">
          <GroupFilter
            selectedGroup={selectedGroup}
            groupList={groupList}
            onChangeHandler={handleGroupChange}
            defaultName={
              groupList.find((g) => g.id === selectedGroup)?.groupName ||
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
              className="btn-std btn-primary"
              startIcon={<AppIcon icon={APP_ICONS.PLUS} size={20} />}
              onClick={showForm}
            >
              Crear
            </Button>
          )}
        </div>
      </div>

      <section className="table-container-full">
        <Table className="styled-table">
          <TableBody>
            {filteredAssignments.map((assignment, index) => (
              <Assignment
                key={assignment.id}
                assignment={assignment}
                index={index}
                handleClickDetail={handleClickDetail}
                handleClickDelete={handleClickDelete}
                handleRowHover={() => {}}
                role={userRole}
              />
            ))}
            {filteredAssignments.length === 0 && (
              <TableRow>
                <TableCell align="center" style={{ padding: '20px' }}>
                  No hay tareas registradas para este grupo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <ConfirmationDialog
        open={confirmationOpen}
        title="¿Eliminar la tarea?"
        content="Ten en cuenta que esta acción también eliminará todas las entregas asociadas."
        cancelText="Cancelar"
        deleteText="Eliminar"
        onCancel={() => setConfirmationOpen(false)}
        onDelete={handleConfirmDelete}
      />
      <ValidationDialog
        open={validationDialogOpen}
        title="Tarea eliminada exitosamente"
        closeText="Cerrar"
        onClose={() => {
          setValidationDialogOpen(false);
          loadAssignmentsByGroupId(selectedGroup || authData?.usergroupid || 0);
        }}
      />
    </div>
  );
}

export default Assignments;