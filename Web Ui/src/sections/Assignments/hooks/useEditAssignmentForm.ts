import { useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { UpdateAssignment } from "../../../modules/Assignments/application/UpdateAssignment";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

interface UseEditAssignmentFormProps {
  assignmentId: number;
  onClose: () => void;
}

export function useEditAssignmentForm({ assignmentId, onClose }: UseEditAssignmentFormProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    setSelectedGroup(event.target.value as number);
  };

  const getCurrentAssignment = async () => {
    const assignmentsRepository = new AssignmentsRepository();
    try {
      const assignment = await assignmentsRepository.getAssignmentById(assignmentId);
      return assignment;
    } catch (error) {
      console.error("Error obteniendo la tarea actual:", error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    try {
      const currentAssignment = await getCurrentAssignment();

      if (currentAssignment) {
        const updatedAssignmentData: AssignmentDataObject = {
          title: title !== "" ? title : currentAssignment.title,
          description: description !== "" ? description : currentAssignment.description,
          groupid: selectedGroup !== 0 ? selectedGroup : currentAssignment.groupid,
          id: currentAssignment.id,
          start_date: currentAssignment.start_date,
          end_date: currentAssignment.end_date,
          state: currentAssignment.state,
          link: currentAssignment.link,
          comment: currentAssignment.comment,
        };

        const assignmentsRepository = new AssignmentsRepository();
        const updateAssignment = new UpdateAssignment(assignmentsRepository);
        await updateAssignment.updateAssignment(assignmentId, updatedAssignmentData);

        onClose();
        window.dispatchEvent(new CustomEvent("assignment-updated"));
      } else {
        console.error("La tarea actual no se encontró.");
      }
    } catch (error: any) {
      console.error("Error al guardar los cambios:", error);

      if (error.message.includes("Ya existe una tarea con el mismo nombre")) {
        setErrorMessage("Error: Ya existe una tarea con el mismo nombre en este grupo");
      } else if (
        error.message.includes("Limite de caracteres excedido") ||
        error.message.includes("Límite de caracteres excedido")
      ) {
        setErrorMessage("Error: Límite de caracteres excedido. El título no puede tener más de 50 caracteres.");
      } else {
        setErrorMessage("Error al actualizar la tarea: " + error.message);
      }

      setErrorOpen(true);
    }
  };

  return {
    title,
    description,
    selectedGroup,
    errorOpen,
    errorMessage,
    setTitle,
    setDescription,
    setErrorOpen,
    handleGroupChange,
    handleSaveChanges,
  };
}