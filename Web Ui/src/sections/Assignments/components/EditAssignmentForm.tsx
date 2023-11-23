import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Filter from "./DatePicker";
import { UpdateAssignment } from "../../../modules/Assignments/application/UpdateAssignment";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { ValidationDialog } from "./ValidationDialog";

interface AssignmentData {
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
}

interface ExistingAssignmentData extends AssignmentData {
  id: number;
  state: string;
  link: string;
  comment: string | null;
}

interface EditAssignmentDialogProps {
  readonly assignmentId: number;
  readonly onClose: () => void;
}

const getDefaultAssignmentData = (): ExistingAssignmentData => ({
  id: 0,
  state: "",
  link: "",
  comment: null,
  title: "",
  description: "",
  start_date: new Date(),
  end_date: new Date(),
});

const getAssignmentData = (data: ExistingAssignmentData): AssignmentData => {
  const { title, description, start_date, end_date } = data;
  return { title, description, start_date, end_date };
};

const useAssignmentData = (assignmentId: number, onClose: () => void) => {
  const [assignment, setAssignment] = useState({
    data: getAssignmentData(getDefaultAssignmentData()),
    existingData: getDefaultAssignmentData(),
  });

  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  const assignmentsRepository = useMemo(() => new AssignmentsRepository(), []);
  const updateAssignment = new UpdateAssignment(assignmentsRepository);
  const isUpdateButtonClicked = useRef(false);

  const setAssignmentDataFromResponse = (data: ExistingAssignmentData) => {
    const commonData = getAssignmentData(data);
    setAssignment({
      data: commonData,
      existingData: data,
    });
  };

  useEffect(() => {
    // Fetch the current assignment data and populate the form
    assignmentsRepository.getAssignmentById(assignmentId).then((data) => {
      if (data) {
        setAssignmentDataFromResponse(data);
      }
    });
  }, [assignmentId, assignmentsRepository]);

  const handleSaveClick = async () => {
    if (isUpdateButtonClicked.current) return;
    isUpdateButtonClicked.current = true;

    if (assignment.data.start_date > assignment.data.end_date) {
      return;
    }

    try {
      // Create a new object with the modified properties
      const updatedAssignmentData = {
        ...assignment.existingData,
        title: assignment.data.title,
        description: assignment.data.description,
        start_date: assignment.data.start_date,
        end_date: assignment.data.end_date,
      };

      // Update the assignment with the new data
      await updateAssignment.updateAssignment(
        assignmentId,
        updatedAssignmentData
      );

      // Show the validation dialog
      setValidationDialogOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDates = (newStartDate: Date, newEndDate: Date) => {
    setAssignment((prevAssignment) => ({
      ...prevAssignment,
      data: {
        ...prevAssignment.data,
        start_date: newStartDate,
        end_date: newEndDate,
      },
    }));
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;
    setAssignment((prevAssignment) => ({
      ...prevAssignment,
      data: {
        ...prevAssignment.data,
        [field]: value,
      },
    }));
  };

  const handleCloseValidationDialog = () => {
    setValidationDialogOpen(false);
    // Close the parent dialog
    onClose();
  };

  return {
    assignmentData: assignment.data,
    validationDialogOpen,
    handleSaveClick,
    handleUpdateDates,
    handleInputChange,
    handleCloseValidationDialog,
  };
};

const EditAssignmentDialog = ({
  assignmentId,
  onClose,
}: EditAssignmentDialogProps) => {
  const {
    assignmentData,
    validationDialogOpen,
    handleSaveClick,
    handleUpdateDates,
    handleInputChange,
    handleCloseValidationDialog,
  } = useAssignmentData(assignmentId, onClose);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Tarea</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            id="titulo"
            label="Titulo"
            variant="outlined"
            size="small"
            required
            value={assignmentData.title}
            onChange={(e) => handleInputChange(e, "title")}
          />
          <TextField
            id="descripcion"
            label="Descripcion"
            variant="outlined"
            size="small"
            required
            sx={{
              "& label.Mui-focused": {
                color: "#001F3F",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#001F3F",
                },
              },
            }}
            onChange={(e) => handleInputChange(e, "description")}
            defaultValue={assignmentData.description}
          />
          <section>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Filter onUpdateDates={handleUpdateDates} />
            </LocalizationProvider>
          </section>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          style={{
            textTransform: "none",
          }}
          onClick={handleSaveClick}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea Actualizada Exitosamente"
          closeText="Cerrar"
          onClose={handleCloseValidationDialog}
        />
      )}
    </Dialog>
  );
};

export default EditAssignmentDialog;
