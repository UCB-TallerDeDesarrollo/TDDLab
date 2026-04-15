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
import { IconifyIcon } from "../../sections/Shared/Components";
import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import LoginComponent from "./components/loginComponent";
import { typographyVariants } from "../../styles/typography";

type NavLink = {
  title: string;
  path: string;
  icon: string;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLink[];
  userRole: string;
}

import TeacherSidebar from "./components/TeacherSidebar";

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const activeButton = navArrayLinks.find(
    (navLink) => navLink.path === location.pathname
  )?.title;

  if (userRole === "teacher") {
    // Si es docente retornamos el Sidebar sin el contenedor con margen superior
    return (
      <div style={{ display: 'flex' }}>
        <TeacherSidebar navArrayLinks={navArrayLinks} />
        {/* Aquí la AppBar principal de logout no va, o se puede ubicar diferente. Según el requerimiento, la vista cambia al Sidebar */}
      </div>
    );
  }

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
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <IconifyIcon icon="mdi:menu" color="white" hoverColor="#e0e0e0" />
            </IconButton>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}
            >
              <img src="/logo.svg" alt="TDDLab Logo" style={{ height: "44px", width: "auto" }} />
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
                        ...typographyVariants.paragraphMedium,
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
