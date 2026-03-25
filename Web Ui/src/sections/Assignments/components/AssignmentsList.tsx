import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import Assignment from "./Assignment";
import SortingComponent from "../../GeneralPurposeComponents/SortingComponent";
import GroupFilter from "./GroupFilter";
import { AssignmentListProps } from "../../../features/assignments/types/assignmentScreen";
import { useAssignmentsScreen } from "../../../features/assignments/hooks/useAssignmentsScreen";

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});

const CustomTableCell1 = styled(TableCell)({
  width: "80%",
});

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

function Assignments({
  ShowForm: showForm,
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<AssignmentListProps>) {
  const {
    assignments,
    confirmationOpen,
    groupList,
    handleClickDelete,
    handleClickDetail,
    handleConfirmDelete,
    handleGroupChange,
    handleOrderAssignments,
    isLoading,
    selectedGroup,
    selectedSorting,
    setConfirmationOpen,
    setValidationDialogOpen,
    showCreateButton,
    validationDialogOpen,
  } = useAssignmentsScreen({
    ShowForm: showForm,
    userRole,
    userGroupid,
    onGroupChange,
  });

  const handleRowHover = (_index: number | null) => {};

  return (
    <Container>
      {isLoading ? (
        <LoadingContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CircularProgress />
          </div>
        </LoadingContainer>
      ) : (
        <section className="Tareas">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              marginBottom: "1rem",
              width: "82%",
              marginLeft: "auto",
              marginRight: "auto",
              flexWrap: "nowrap",
            }}
          >
            <GroupFilter
              selectedGroup={selectedGroup}
              groupList={groupList}
              onChangeHandler={handleGroupChange}
              defaultName={
                groupList.find((group) => group.id === selectedGroup)?.groupName ||
                groupList[0]?.groupName ||
                "Selecciona un grupo"
              }
            />
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleOrderAssignments}
            />
            {showCreateButton && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "17px",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  paddingX: "16px",
                  paddingY: "8px",
                  minWidth: "90px",
                  whiteSpace: "nowrap",
                }}
                onClick={showForm}
              >
                Crear
              </Button>
            )}
          </div>

          <StyledTable>
            <TableHead>
              <TableRow
                sx={{
                  borderBottom: "2px solid #E7E7E7",
                }}
              >
                <CustomTableCell1
                  sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}
                >
                  Tareas
                </CustomTableCell1>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment, index) => (
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
              }}
            />
          )}
        </section>
      )}
    </Container>
  );
}

export default Assignments;
