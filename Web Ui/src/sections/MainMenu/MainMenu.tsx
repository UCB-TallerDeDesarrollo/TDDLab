import { Button, Box, Drawer, AppBar, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ReactElement, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import NavLateralMenu from "./components/LateralMenu";
import LoginComponent from "./components/loginComponent";

import logoTddLab from "../../assets/logo-tddlab.svg";

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
      <AppBar position="fixed" className="main-navbar" elevation={0}>
        <Toolbar className="navbar-toolbar">

          <div className="navbar-brand-group">
            <IconButton
              color="inherit"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", sm: "none" }, mr:1 }}
            >
              <MenuIcon />
            </IconButton>
            <NavLink to="/" className="navbar-brand-link">
              <img 
                src={logoTddLab} 
                alt="TDDLab Logo" 
                style={{ height: '40px', width: 'auto' }} // Ajusta el alto según prefieras
              />
            </NavLink>
          </div>

          <div className="navbar-actions-group">
            <Box sx={{ display: { xs: "none", sm: "flex" }, height: '100%' }}>
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
