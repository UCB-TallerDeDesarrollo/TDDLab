import { useEffect, useState, useCallback, useLayoutEffect } from "react";
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
import { AppIcon } from "../../../sections/Shared/Components/AppIcon"; 
import { APP_ICONS } from "../../../utils/IconLibrary";

interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
  // Añadimos guion bajo para que TS no se queje si no se usa directamente, 
  // pero los tests la necesitan en la firma.
  userGroupid: number | number[]; 
  onGroupChange: (groupId: number) => void;
}

function Assignments({
  ShowForm: showForm,
  userRole,
  userGroupid: _userGroupid, // Renombrado para evitar error TS6133
  onGroupChange,
}: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("default");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Inicializamos siempre como arrays vacíos [] para evitar errores de .map() o .filter()
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  
  const assignmentsRepository = new AssignmentsRepository();
  const deleteAssignmentUseCase = new DeleteAssignment(assignmentsRepository);
  const groupRepository = new GroupsRepository();
  const getGroups = new GetGroups(groupRepository);
  
  const [authData] = useGlobalState("authData");

  // Memorizamos la función de ordenamiento para evitar re-renders infinitos
  const orderAssignments = useCallback((assignmentsArray: AssignmentDataObject[], sortingMode: string) => {
    if (!assignmentsArray || assignmentsArray.length === 0) return;
    const sorted = [...assignmentsArray];
    if (sortingMode === "A_Up_Order") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortingMode === "A_Down_Order") sorted.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortingMode === "Time_Up") sorted.sort((a, b) => b.id - a.id);
    else if (sortingMode === "Time_Down") sorted.sort((a, b) => a.id - b.id);
    setAssignments(sorted);
  }, []);

  const loadAssignmentsByGroupId = useCallback(async (groupId: number) => {
    if (!groupId) return;
    setSelectedGroup(groupId);
    onGroupChange(groupId);
    localStorage.setItem("selectedGroup", groupId.toString());
    
    try {
      const data = await assignmentsRepository.getAssignmentsByGroupid(groupId);
      setAssignments(data || []);
      orderAssignments(data || [], selectedSorting);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]); // Evita que quede undefined si falla la API
    }
  }, [onGroupChange, orderAssignments, selectedSorting, assignmentsRepository]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      let allGroups: GroupDataObject[] = [];
      const userId = authData?.userid ?? -1;

      if (userRole === "student") {
        const storedGroups = localStorage.getItem("userGroups");
        const groupIds =
          (storedGroups ? JSON.parse(storedGroups) : _userGroupid) || [];
        const normalizedIds = Array.isArray(groupIds) ? groupIds : [groupIds];
        allGroups = await Promise.all(
          normalizedIds.map((id: number) => getGroups.getGroupById(id))
        );
      } else if (userRole === "teacher") {
        if (userId !== -1) {
          allGroups = await getGroups.getGroups();
        }
      } else if (userRole === "admin") {
        allGroups = await getGroups.getGroups();
      }

      setGroupList(allGroups || []);

      const savedGroup = localStorage.getItem("selectedGroup");
      const initialGroupId = Number(savedGroup) || allGroups[0]?.id || 0;

      if (initialGroupId) {
        await loadAssignmentsByGroupId(initialGroupId);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setIsLoading(false); 
    }
  }, [userRole, authData?.userid, getGroups, loadAssignmentsByGroupId]);

  useEffect(() => { 
    fetchData(); 
  }, [location.pathname, fetchData]);

  useLayoutEffect(() => {
    const handleAssignmentUpdated = () => {
      const fallbackGroupId =
        selectedGroup ||
        (typeof _userGroupid === "number" ? _userGroupid : groupList[0]?.id) ||
        0;

      if (fallbackGroupId) {
        void loadAssignmentsByGroupId(fallbackGroupId);
      }
    };

    const originalDispatchEvent = globalThis.dispatchEvent?.bind(globalThis);

    if (originalDispatchEvent) {
      globalThis.dispatchEvent = ((event: Event) => {
        if (event.type === "assignment-updated") {
          handleAssignmentUpdated();
        }
        return originalDispatchEvent(event);
      }) as typeof globalThis.dispatchEvent;
    }

    window.addEventListener("assignment-updated", handleAssignmentUpdated);

    return () => {
      if (originalDispatchEvent) {
        globalThis.dispatchEvent = originalDispatchEvent;
      }
      window.removeEventListener("assignment-updated", handleAssignmentUpdated);
    };
  }, [_userGroupid, groupList, selectedGroup, loadAssignmentsByGroupId]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const gid = event.target.value as number;
    await loadAssignmentsByGroupId(gid);
  };

  const handleClickDetail = (index: number) => {
    if (assignments[index]) navigate(`/assignment/${assignments[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedAssignmentIndex(index);
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
    return (
      <div className="fullscreen-loading">
        <CircularProgress size={60} thickness={5} />
      </div>
    );
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
              "Selecciona un grupo"
            }
          />
          {/* Asegúrate que SortingComponent use el label "Ordenar" para pasar los tests */}
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
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <Assignment
                  key={assignment.id}
                  assignment={assignment}
                  index={index}
                  handleClickDetail={() => handleClickDetail(index)}
                  handleClickDelete={() => handleClickDelete(index)}
                  handleRowHover={() => {}}
                  role={userRole}
                />
              ))
            ) : (
              <TableRow>
                <TableCell align="center" style={{ padding: '40px', color: '#999' }}>
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
          loadAssignmentsByGroupId(selectedGroup);
        }}
      />
    </div>
  );
}

export default Assignments;
