
import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Button, Tabs, Tab, Typography } from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';

const theme = createTheme({
  palette: {
    secondary: {
      main: '#fff' // Cambiar el color secundario a blanco
    }
  }
});

const Navbar = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar sx={{ background: "#052845" }}>
        <Toolbar>
          <WindowIcon />
          <Typography>
            TDDLab
          </Typography>
          <Tabs
            textColor="inherit"
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
          >
            <Tab label="Grupos" />
            <Tab label="Tareas" />
            <Tab label="Usuario" />
          </Tabs>
          <Button sx={{ marginLeft: 'auto' }} variant="contained">
            Iniciar sesión
          </Button>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default Navbar;