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

import { GetAssignments } from "../../../modules/Assignments/application/GetAssignments"; 
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { SubmitAssignment } from "../../../modules/Assignments/application/SubmitAssignment";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { GitLinkDialog } from "./GitHubLinkDialog";
import { ValidationDialog } from "./ValidationDialog";
import Assignment from "./Assignment";

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const CustomTableCell1 = styled(TableCell)({
  width: "90%",
});

const CustomTableCell2 = styled(TableCell)({
  width: "10%",
});

interface AssignmentsProps {
  ShowForm: () => void;
}

function Assignments({ ShowForm: showForm }: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [githubLinkDialogOpen, setGithubLinkDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
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
  const submitAssignment = new SubmitAssignment(assignmentsRepository);

  useEffect(() => {
  
    getAssignments
      .obtainAllAssignments()
      .then((data) => {
        setAssignments(data);
      })
      .catch((error) => {
        console.error("Error fetching assignments:", error);
      });
  });

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

  const handleSendGithubLink = (link: string) => {
    if (selectedAssignmentIndex !== null) {
      submitAssignment.submitAssignment(
        assignments[selectedAssignmentIndex].id,
        link
      );
    }
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  return (
    <Container>
      <section className="Tareas">
        <Table>
          <TableHead>
            <TableRow>
              <CustomTableCell1>Tareas</CustomTableCell1>
              <CustomTableCell2>
                <ButtonContainer>
                  <Button variant="outlined" onClick={showForm}>
                    Crear
                  </Button>
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
              />
            ))}
          </TableBody>
        </Table>
        {githubLinkDialogOpen && (
          <GitLinkDialog
            open={githubLinkDialogOpen}
            onClose={() => setGithubLinkDialogOpen(false)}
            onSend={handleSendGithubLink}
          />
        )}
        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la tarea?"
            content= {
              <>
                Ten en cuenta que esta acción tambien eliminará  <br /> todas las entregas asociadas.
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
            onClose={() => setValidationDialogOpen(false)}
          />
        )}
      </section>
    </Container>
  );
}

export default Assignments;
