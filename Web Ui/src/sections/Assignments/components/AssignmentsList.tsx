import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress,
  TableHead,
  TableBody,
  TableRow,
  Container,
  Button } from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AddIcon from "@mui/icons-material/Add";
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import Assignment from "./Assignment";
import SortingComponent from "../../GeneralPurposeComponents/SortingComponent";
import GroupFilter from "./GroupFilter";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import './AssignmentsList.css';
import { CustomTableCell1, StyledTable, LoadingContainer } from "./AssigmentsStyledComponents";
import useAssignments from "../hooks/useAssigments";



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
  const navigate = useNavigate();
  const [authData] = useGlobalState("authData");

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number | null>(null);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [, setDeleteLoading] = useState(false);

  const {
    assignments,
    setAssignments,
    groupList,
    selectedGroup,
    isLoading,
    loadAssignmentsByGroupId,
    handleGroupChange,
  } = useAssignments({ userRole, userGroupid, onGroupChange });
  const assignmentsRepository = useMemo(() => new AssignmentsRepository(), []);
  const deleteAssignmentUseCase = useMemo(
    () => new DeleteAssignment(assignmentsRepository),
    [assignmentsRepository]
  );

  const orderAssignments = (assignmentsArray: AssignmentDataObject[], sorting: string) => {
    if (!assignmentsArray.length) return;
    if (sorting === "A_Up_Order")  assignmentsArray.sort((a, b) => a.title.localeCompare(b.title));
    if (sorting === "A_Down_Order") assignmentsArray.sort((a, b) => b.title.localeCompare(a.title));
    if (sorting === "Time_Up")     assignmentsArray.sort((a, b) => b.id - a.id);
    if (sorting === "Time_Down")   assignmentsArray.sort((a, b) => a.id - b.id);
    setAssignments(assignmentsArray);
  };

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  // Re-sort when authData or sorting changes
  useEffect(() => {
    const preferredGroupId = Number(localStorage.getItem("selectedGroup")) || authData?.usergroupid;
    if (!preferredGroupId) return;
    assignmentsRepository.getAssignmentsByGroupid(preferredGroupId).then((data) => {
      setAssignments(data);
      orderAssignments([...data], selectedSorting);
    }).catch((error) => console.error("Error fetching assignments:", error));
  }, [authData, selectedSorting]);

  const filteredAssignments = selectedGroup
    ? assignments.filter((a) => a.groupid === selectedGroup)
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
    if (selectedAssignmentIndex === null || !assignments[selectedAssignmentIndex]) {
      setConfirmationOpen(false);
      return;
    }
    setDeleteLoading(true);
    try {
      const assignmentToDelete = assignments[selectedAssignmentIndex];
      await deleteAssignmentUseCase.deleteAssignment(assignmentToDelete.id);
      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error eliminando assignment:", error);
    } finally {
      setConfirmationOpen(false);
      setDeleteLoading(false);
      setSelectedAssignmentIndex(null);
    }
  };

  const handleRowHover = (index: number | null) => setHoveredRow(index);

 return (
  <Container>
    {isLoading ? (
      <LoadingContainer>
         <div className="assignments-list-loading">
      <CircularProgress />
    </div>
      </LoadingContainer>
    ) : (
      <section className="Tareas">
        {/* 🔹 Botones separados de la tabla */}
        {/* 🔹 Botones arriba de la tabla en una sola línea */}
        <div className="assignments-list-toolbar">
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
              className="assignments-list-create-btn"
              onClick={showForm}
            >
              Crear
            </Button>
          )}
        </div>


        {/* 🔹 Tabla solo con encabezado de columnas */}
        <StyledTable>
          <TableHead>
            <TableRow
              className="assignments-list-header-row"
            >
              <CustomTableCell1
              >
                Tareas
              </CustomTableCell1>
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

        {/* Diálogos */}
        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la tarea?"
            content={
              <>
                Ten en cuenta que esta acción también eliminará <br /> todas las
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
            onClose={() => {
              setValidationDialogOpen(false);
              // Refrescar datos del grupo actual sin recargar página
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

}

export default Assignments;