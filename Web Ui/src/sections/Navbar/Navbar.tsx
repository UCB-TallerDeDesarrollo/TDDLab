import {
  Button,
  Box,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import NavLateralMenu from "./components/NavLateralMenu";
import MenuIcon from "@mui/icons-material/Menu";
import { ReactElement, useState } from "react";
import { NavLink } from "react-router-dom";
import WindowIcon from "@mui/icons-material/Window";

type NavLink = {
  title: string;
  path: string;
  icon: ReactElement;
};

interface NavbarProps {
  navArrayLinks: NavLink[];
}

export default function Navbar({ navArrayLinks }: Readonly<NavbarProps>) {
  const [open, setOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("");

  const handleButtonClick = (title: string) => {
    setActiveButton(title);
  };

  return (
    <div style={{ marginTop: "100px" }}>
      <AppBar position="fixed" sx={{ background: "#052845" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            size="large"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <WindowIcon sx={{ marginRight: "6px" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TDDLab
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navArrayLinks.map((item) => (
              <Button
                key={item.title}
                component={NavLink}
                to={item.path}
                onClick={() => handleButtonClick(item.title)}
                sx={{
                  borderBottom:
                    activeButton === item.title ? "2px solid #fff" : "none",
                  color: activeButton === item.title ? "#fff" : "#A9A9A9",
                }}
              >
                {item.title}
              </Button>
            ))}
            <Button
              component={NavLink}
              to="/login"
              variant="contained"
              sx={{ marginLeft: "18px" }}
            >
              Iniciar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <NavLateralMenu
          navArrayLinks={navArrayLinks}
          NavLink={NavLink}
          setOpen={setOpen}
        />
      </Drawer>
    </div>
  );
}
