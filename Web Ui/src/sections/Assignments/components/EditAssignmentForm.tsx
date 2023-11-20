import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";
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
  comment: string | null; // Make comment nullable
}

function EditAssignmentDialog({
  assignmentId,
  onClose,
}: {
  readonly assignmentId: number;
  readonly onClose: () => void;
}) {
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
  });
  const [existingAssignmentData, setExistingAssignmentData] =
    useState<ExistingAssignmentData>({
      id: 0,
      state: "",
      link: "",
      comment: null,
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
        setAssignmentData({
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        });
        setExistingAssignmentData({
          id: data.id,
          state: data.state,
          link: data.link,
          comment: data.comment,
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        });
      }
    });
  }, [assignmentId]);

  const handleSaveClick = async () => {
    if (isUpdateButtonClicked.current) return;
    isUpdateButtonClicked.current = true;

    if (assignmentData.start_date > assignmentData.end_date) {
      return;
    }

    try {
      // Create a new object with the modified properties
      const updatedAssignmentData = {
        ...existingAssignmentData,
        title: assignmentData.title,
        description: assignmentData.description,
        start_date: assignmentData.start_date,
        end_date: assignmentData.end_date,
      };

      // Update the assignment with the new data
      await updateAssignment.updateAssignment(
        assignmentId,
        updatedAssignmentData
      );
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
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Assignment</DialogTitle>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          style={{
            textTransform: "none",
          }}
          onClick={handleSaveClick}
        >
          Save Changes
        </Button>
      </DialogActions>
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
    </Dialog>
  );
}

export default EditAssignmentDialog;
