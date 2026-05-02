import { useState, useRef, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { CreateAssignments } from "../../../modules/Assignments/application/CreateAssingment";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

interface AssignmentData {
  id: number;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  state: string;
  link: string;
  comment: string;
  groupid: number;
}

interface UseAssignmentFormProps {
  open: boolean;
  groupid: number;
  groups: GroupDataObject[];
  handleClose: () => void;
}

export function useAssignmentForm({ open, groupid, groups, handleClose }: UseAssignmentFormProps) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("Tarea creada exitosamente");
  const isCreateButtonClicked = useRef(false);

  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    id: 0,
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    state: "pending",
    link: "",
    comment: "",
    groupid,
  });

  // Reset al abrir el dialog
  useEffect(() => {
    const effectiveGroupId =
      groupid || Number(localStorage.getItem("selectedGroup") ?? 0) || 0;

    setSave(false);
    setAssignmentData({
      id: 0,
      title: "",
      description: "",
      start_date: new Date(),
      end_date: new Date(),
      state: "pending",
      link: "",
      comment: "",
      groupid: effectiveGroupId,
    });
  }, [open, groupid]);

  // Sincronizar groupid cuando carguen los grupos
  useEffect(() => {
    setAssignmentData((prev) => {
      const keepCurrent = groups.some((g) => g.id === prev.groupid);
      const fallbackId = groups[0]?.id ?? 0;
      return { ...prev, groupid: keepCurrent ? prev.groupid : fallbackId };
    });
  }, [groups]);

  const formInvalid = () =>
    assignmentData.title.trim() === "" || assignmentData.groupid === 0;

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;
    setAssignmentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    const newGroupId = event.target.value as number;
    setAssignmentData((prev) => ({ ...prev, groupid: newGroupId }));
  };

  const handleUpdateDates = (newStartDate: Date, newEndDate: Date) => {
    setAssignmentData((prev) => ({
      ...prev,
      start_date: newStartDate,
      end_date: newEndDate,
    }));
  };

  const handleCancel = () => handleClose();

  const handleSaveClick = async () => {
    setSave(true);
    if (formInvalid()) return;

    isCreateButtonClicked.current = true;
    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);

    if (assignmentData.start_date > assignmentData.end_date) {
      setValidationMessage("Error: La fecha de inicio no puede ser posterior a la fecha de fin");
      setValidationDialogOpen(true);
      setSave(false);
      return;
    }

    try {
      const assignments = await assignmentsRepository.getAssignmentsByGroupid(assignmentData.groupid);
      const duplicateAssignment = assignments.find(
        (assignment) =>
          assignment.title.toLowerCase() === assignmentData.title.toLowerCase()
      );

      if (duplicateAssignment) {
        setValidationMessage("Error: Ya existe una tarea con el mismo nombre en este grupo");
        setValidationDialogOpen(true);
        setSave(false);
        return;
      }

      await createAssignments.createAssignment(assignmentData);
      setValidationMessage("Tarea creada exitosamente");
      setValidationDialogOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Limite de caracteres excedido")) {
          setValidationMessage("Error: El título no puede tener más de 50 caracteres.");
        } else {
          setValidationMessage(`Error: ${error.message}`);
        }
      } else {
        setValidationMessage("Error desconocido al crear la tarea.");
      }
      setValidationDialogOpen(true);
    } finally {
      setSave(false);
    }
  };

  const handleValidationClose = () => {
    if (!validationMessage.includes("Error")) {
      window.location.reload();
    } else {
      setValidationDialogOpen(false);
    }
  };

  return {
    save,
    assignmentData,
    validationDialogOpen,
    validationMessage,
    formInvalid,
    handleInputChange,
    handleGroupChange,
    handleUpdateDates,
    handleCancel,
    handleSaveClick,
    handleValidationClose,
  };
}