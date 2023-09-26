import { useState } from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import { Box, Container, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Filter from "./datePicker";



function Formulario2() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGuardarClick = () => {
    setSuccessMessage('Cambios guardados con éxito');
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

export default Formulario2;