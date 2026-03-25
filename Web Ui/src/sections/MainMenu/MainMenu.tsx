import {
  Button,
  Box,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import NavLateralMenu from "./components/LateralMenu";
import MenuIcon from "@mui/icons-material/Menu";
import { ReactElement, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import WindowIcon from "@mui/icons-material/Window";
import LoginComponent from "./components/loginComponent";
import "../../App.css";
import "../MainMenu/styles/MainMenuStyles.css"

type NavLink = {
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLink[];
  userRole: string;
}

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="page-top-spacer">
      <AppBar position="fixed" className="main-navbar" elevation={0}
      >
        <Toolbar className="navbar-toolbar">
          <div className="navbar-brand-group">
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <NavLink to="/" className="navbar-brand-link">
              <WindowIcon className="navbar-brand-icon" />
              <Typography variant="h6">TDDLab</Typography>
            </NavLink>
          </div>
          <div className="navbar-actions-group">
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navArrayLinks.map((item) =>
                item.access.includes(userRole) && (
                  <Button
                    key={item.title}
                    component={NavLink}
                    to={item.path}
                    className={`nav-link-btn ${isActive(item.path) ? "nav-link-active" : ""}`}
                  >
                    {item.title}
                  </Button>
                )
              )}
            </Box>
            <LoginComponent />
          </div>
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
