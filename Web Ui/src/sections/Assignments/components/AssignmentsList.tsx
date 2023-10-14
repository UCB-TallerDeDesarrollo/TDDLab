import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentsRepository from '../../../modules/Assignments/repository/assignment.API';
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
import { SendAssignment } from "../../../modules/Assignments/application/SendAssignment";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { GitLinkDialog } from "./GitHubLinkDialog";
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
  mostrarFormulario: () => void;
}

function Assignments({ mostrarFormulario }: AssignmentsProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [githubLinkDialogOpen, setGithubLinkDialogOpen] = useState(false);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const [, setSelectedRow] = useState<number | null>(null);
  const [, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();
  const getAssignments = new GetAssignments(assignmentsRepository);
  const deleteAssignments = new DeleteAssignment(assignmentsRepository);
  const sendAssignments = new SendAssignment(assignmentsRepository);

  useEffect(() => {
    getAssignments.obtainAllAssignments()
      .then((data) => {
        setAssignments(data);
      })
      .catch((error) => {
        console.error("Error fetching assignments:", error);
      });
  }, []);

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
      if (selectedAssignmentIndex !== null && assignments[selectedAssignmentIndex]) {
        await deleteAssignments.deleteAssignment(assignments[selectedAssignmentIndex].id);
      }
      setConfirmationOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickUpdate = (index: number) => {
    setSelectedRow(index);
    setGithubLinkDialogOpen(true);
    sendAssignments.sendAssignment(assignments[index].id);
  };

  const handleSendGithubLink = (link: string) => {
    console.log("Sending Github link:", link);
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
                  <Button variant="outlined" onClick={mostrarFormulario}>
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
                handleClickUpdate={handleClickUpdate}
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
            title="Eliminar tarea"
            content="¿Estás seguro de que deseas eliminar esta tarea?"
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={() => setConfirmationOpen(false)}
            onDelete={handleConfirmDelete}
          />
        )}
      </section>
    </Container>
  );
}

export default Assignments;
