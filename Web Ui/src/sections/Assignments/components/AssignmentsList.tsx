import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AddIcon from "@mui/icons-material/Add";
import { GetAssignments } from "../../../modules/Assignments/application/GetAssignments";
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import Assignment from "./Assignment";
import SortingComponent from "../../GeneralPurposeComponents/SortingComponent";

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

interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
}

function Assignments({
  ShowForm: showForm,
  userRole,
}: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const [, setSelectedRow] = useState<number | null>(null);
  const [, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();
  const getAssignments = new GetAssignments(assignmentsRepository);
  const deleteAssignment = new DeleteAssignment(assignmentsRepository);
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getAssignments.obtainAllAssignments();

        // Sort assignments based on the selectedSorting option
        const sortedAssignments = [...data];
        if (selectedSorting === "A_Up_Order") {
          sortedAssignments.sort((a, b) => a.title.localeCompare(b.title));
        } else if (selectedSorting === "A_Down_Order") {
          sortedAssignments.sort((a, b) => b.title.localeCompare(a.title));
        } else if (selectedSorting === "Time_Up") {
          sortedAssignments.sort((a, b) => b.id - a.id);
        } else if (selectedSorting === "Time_Down") {
          sortedAssignments.sort((a, b) => a.id - b.id);
        } else {
          setAssignments(data);
        }
        // Add more sorting options as needed

        setAssignments(sortedAssignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    fetchAssignments();
  }, [selectedSorting]);

  const handleOrdenarChange = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value as string);
  };

  const handleClickDetail = (index: number) => {
    setSelectedRow(index);
    navigate(`/assignment/${assignments[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedAssignmentIndex(index);
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
          assignments[selectedAssignmentIndex].id
        );
        await deleteAssignment.deleteAssignment(
          assignments[selectedAssignmentIndex].id
        );
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
      <section className="Tareas">
        <StyledTable>
          <TableHead>
            <TableRow>
              <CustomTableCell1
                sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}
              >
                Tareas
              </CustomTableCell1>
              <CustomTableCell2>
                <ButtonContainer>
                  <SortingComponent
                    selectedSorting={selectedSorting}
                    onChangeHandler={handleOrdenarChange}
                  />

                  {userRole === "admin" && (
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
    </Container>
  );
}

export default Assignments;
