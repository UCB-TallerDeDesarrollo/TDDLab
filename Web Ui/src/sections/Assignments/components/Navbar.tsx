import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WindowIcon from "@mui/icons-material/Window";
import LateralMenu from "./LateralMenu";

const PAGES=["Grupos","Tareas", "Usuario"];
const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});


const Navbar = () => {
  const [value, setValue] = useState(0);
  const theme2 = useTheme();
  console.log(theme2);
  const isMatch = useMediaQuery(theme2.breakpoints.down("md"));
  console.log(isMatch);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar sx={{ background: "#052845" }}>
        <Toolbar>
          <WindowIcon sx={{ marginRight: "6px" }} />
          <Typography sx={{ marginRight: "70px" }}>TDDLab</Typography>
          {isMatch ? (
            <>
              <LateralMenu />
            </>
          ) : (
            <>
              <div style={{ marginLeft: "auto" }}>
                <Tabs
                  textColor="inherit"
                  value={value}
                  onChange={handleChange}
                  indicatorColor="secondary"
                >
                    {
                      PAGES.map((page, index)=>(
                        <Tab key={index} label={page}/>
                      ))
                    }

                </Tabs>
              </div>

              <Button variant="contained" sx={{ marginLeft: "18px" }}>Iniciar sesión</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
