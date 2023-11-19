import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Box, Container, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Filter from "./DatePicker";
import { UpdateAssignment } from "../../../modules/Assignments/application/UpdateAssignment";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { ValidationDialog } from "./ValidationDialog";

function EditAssignmentForm({
  assignmentId,
  onClose,
}: {
  assignmentId: number;
  onClose: () => void;
}) {
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
  });
  const isUpdateButtonClicked = useRef(false);

  const assignmentsRepository = new AssignmentsRepository();
  const updateAssignment = new UpdateAssignment(assignmentsRepository);

  useEffect(() => {
    // Fetch the current assignment data and populate the form
    assignmentsRepository.getAssignmentById(assignmentId).then((data) => {
      if (data) {
        setAssignmentData(data);
      }
    });
  }, [assignmentId]);

  const handleSaveClick = async () => {
    if (isUpdateButtonClicked.current) return; // Prevent multiple clicks
    isUpdateButtonClicked.current = true;

    if (assignmentData.start_date > assignmentData.end_date) {
      return;
    }

    try {
      await updateAssignment.updateAssignment(assignmentId, assignmentData);
    } catch (error) {
      console.error(error);
    }
    setValidationDialogOpen(true);
  };

  const handleUpdateDates = (newStartDate: Date, newEndDate: Date) => {
    setAssignmentData((prevData) => ({
      ...prevData,
      start_date: newStartDate,
      end_date: newEndDate,
    }));
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;
    setAssignmentData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "grid", gap: 2 }} component="form" autoComplete="off">
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
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            style={{
              textTransform: "none",
            }}
            onClick={handleSaveClick}
          >
            Guardar cambios
          </Button>
        </Stack>
      </Box>
      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea Actualizada Exitosamente"
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
            onClose();
          }}
        />
      )}
    </Container>
  );
}

export default EditAssignmentForm;
