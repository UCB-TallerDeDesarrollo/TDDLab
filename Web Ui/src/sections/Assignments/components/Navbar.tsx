import {
  Button,
  Box,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import NavLateralMenu from "./NavLateralMenu";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";

const navLinks = [
  {
    title: "Grupos",
    path: "#",
    icon: <GroupsIcon />,
  },
  {
    title: "Tareas",
    path: "#login",
    icon: <DescriptionIcon />,
  },
  {
    title: "Usuario",
    path: "#register",
    icon: <PersonIcon />,
  },
  {
    title: "Iniciar sesión",
    path: "#",
    icon: <LoginIcon />,
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "75px" }}>
      <AppBar
        position="fixed"
        sx={{ background: "#052845" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            size="large"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            TDDLab
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navLinks.map((item) => (
              <Button
                color="inherit"
                key={item.title}
                component="a"
                href={item.path}
              >
                {item.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <NavLateralMenu navLinks={navLinks} />
      </Drawer>
    </div>
  );
}
