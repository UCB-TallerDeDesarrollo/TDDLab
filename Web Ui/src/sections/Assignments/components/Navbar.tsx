import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Button, Tabs, Tab, Typography } from "@mui/material";
import WindowIcon from "@mui/icons-material/Window";
import LateralMenu from "./LateralMenu";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
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
          <WindowIcon sx={{ marginRight: "6px" }} />
          <Typography sx={{ marginRight: "70px" }}>TDDLab</Typography>
          <div style={{ marginLeft: 'auto' }}> 
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
          </div>
          
          <Button
            
            variant="contained"
          >
            Iniciar sesión
          </Button>
        </Toolbar>
        <LateralMenu/>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
