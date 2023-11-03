import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Box, Container, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Filter from "./DatePicker";
import { CreateAssignments } from "../../../modules/Assignments/application/CreateAssingment";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

function Form() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [flag, setFlag] = useState(true);
  const [assignmentData, setAssignmentData] = useState({
    id: 0,
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    state: "pending",
    link: "",
  });

  const handleGuardarClick = async () => {
    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);
    if (assignmentData.start_date > assignmentData.end_date) {
      setFlag(false);
      setSuccessMessage("Error fecha incorrecta");

      return;
    }
    try {
      await createAssignments.createAssignment(assignmentData);
      setFlag(true);
      setSuccessMessage("Cambios guardados con éxito");
    } catch (error) {
      console.error(error);
    }
    window.location.reload();
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
    field: string // 'title' or 'description'
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
            onClick={handleGuardarClick}
          >
            Guardar cambios
          </Button>
        </Stack>

        {successMessage && (
          <Typography sx={{ marginTop: 2 }} color={flag ? "green" : "error"}>
            {successMessage}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default Form;
