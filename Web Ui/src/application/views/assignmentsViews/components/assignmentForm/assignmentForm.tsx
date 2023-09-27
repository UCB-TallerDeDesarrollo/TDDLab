import { useState } from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import { Box, Container, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Filter from "./datePicker";
import { createAssignmentsUseCase } from '../../useCases/createAssingmentsAdapter';



function Formulario() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    id: 0, 
    title: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    state: '',

  });

  const handleGuardarClick  = async () => {
    try {
      await createAssignmentsUseCase(assignmentData);

      setSuccessMessage('Cambios guardados con éxito');
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
  
    // If the input element's id matches a field in assignmentData, update it
    if (id in assignmentData) {
      setAssignmentData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };


  return (
    <>
      <Container maxWidth="sm">
        <Box
          sx={{ display: 'grid', gap: 2 }}
          component="form"
          autoComplete="off"
        >
          <TextField
            id="titulo"
            label="Titulo"
            variant="outlined"
            size="small"
            required
            onChange={handleInputChange}

          />
          <TextField
            id="descripcion"
            label="Descripcion"
            variant="outlined"
            size="small"
            required
            sx={{
              '& label.Mui-focused': {
                color: '#001F3F',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#001F3F',
                },
              },
            }}
            onChange={handleInputChange}
          />
          <section>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Filter />
            </LocalizationProvider>
          </section>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              endIcon={<SaveIcon />}
              style={{
                backgroundColor: '#001F3F',
                textTransform: 'uppercase',
              }}
              onClick={handleGuardarClick}
            >
              Guardar cambios
            </Button>
          </Stack>

          {successMessage && (
            <Typography sx={{ marginTop: 2, color: 'green' }}>
              {successMessage}
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
}


export default Formulario;
