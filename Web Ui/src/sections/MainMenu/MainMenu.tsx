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
    <div style={{ marginTop: "100px" }}>
      <AppBar position="fixed" sx={{ background: "#052845" }}>
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <WindowIcon sx={{ marginRight: "6px", marginTop: "4px" }} />
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                TDDLab
              </Typography>
            </NavLink>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginRight: "30px",
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navArrayLinks.map(
                (item) =>
                  item.access.includes(userRole) && (
                    <Button
                      key={item.title}
                      component={NavLink}
                      to={item.path}
                      sx={{
                        borderBottom:
                          activeButton === item.title
                            ? "2px solid #fff"
                            : "none",
                        color: activeButton === item.title ? "#fff" : "#A9A9A9",
                      }}
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
