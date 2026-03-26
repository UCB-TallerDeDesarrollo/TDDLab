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
import "./styles/MainMenu.css";
import MainMenuSX from "./styles/MainMenu";


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

  const activeButton = navArrayLinks.find(
    (navLink) => navLink.path === location.pathname
  )?.title;

  return (
    <div className="main-menu-wrapper">
      <AppBar position="fixed" sx={{ background: "#052845" }}>
        <Toolbar className="main-menu-toolbar">
          <div className="main-menu-left">
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={MainMenuSX.dFlexNoSm}
            >
              <MenuIcon />
            </IconButton>
            <WindowIcon sx={{ marginRight: "6px", marginTop: "4px" }} />
            <NavLink
              to="/"
              className="main-menu-logo-link"
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                TDDLab
              </Typography>
            </NavLink>
          </div>
          <div className="main-menu-right">
            <Box sx={MainMenuSX.dNoneSmBlock}>
              {navArrayLinks.map(
                (item) =>
                  item.access.includes(userRole) && (
                    <Button
                      key={item.title}
                      component={NavLink}
                      to={item.path}
                      sx={MainMenuSX.button(activeButton === item.title)}
                    >
                      {item.title}
                    </Button>
                  )
              )}
            </Box>
            <LoginComponent></LoginComponent>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={MainMenuSX.dFlexNoSm}
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
