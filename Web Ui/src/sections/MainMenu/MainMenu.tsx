import {
  Button,
  Box,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
} from "@mui/material";

import NavLateralMenu from "./components/LateralMenu";
import { IconifyIcon } from "../../sections/Shared/Components";
import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import LoginComponent from "./components/loginComponent";
import { typographyVariants } from "../../styles/typography";
import TeacherSidebar from "./components/TeacherSidebar";
import StudentSidebar from "./components/StudentSidebar";

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

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const activeButton = navArrayLinks.find(
    (navLink) => navLink.path === location.pathname
  )?.title;

  if (userRole === "teacher" || userRole === "student") {
    const SidebarComponent = userRole === "teacher" ? TeacherSidebar : StudentSidebar;

    return (
      <>
        <SidebarComponent 
          navArrayLinks={navArrayLinks} 
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        
        {/* Top Bar (Blue Line) */}
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            background: "#0d1b2a",
            boxShadow: "none",
            height: 90,
            justifyContent: "center",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: "16px", sm: "30px" }, // More compact on mobile
            }}
          >
            {/* Logo in Top Bar */}
            <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src="/logo.svg"
                alt="TDDLab Logo"
                sx={{ height: { xs: 36, sm: 52 }, width: "auto" }}
              />
            </NavLink>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '8px', sm: '16px' } }}>
              <LoginComponent />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Hamburger button below the logo on mobile */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: 100, // Just below the 90px AppBar
              left: 16,
              zIndex: (theme) => theme.zIndex.appBar,
            }}
          >
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid #e0e0e0",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                width: 44,
                height: 44,
              }}
            >
              <IconifyIcon icon="mdi:menu" color="#0d1b2a" width={24} height={24} />
            </IconButton>
          </Box>
        )}
      </>
    );
  }

  return (
    <div>
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
              onClick={() => setMobileOpen(true)}
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
        open={mobileOpen}
        anchor="left"
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <NavLateralMenu
          navArrayLinks={navArrayLinks}
          NavLink={NavLink}
          setOpen={setMobileOpen}
        />
      </Drawer>
    </div>
  );
}
