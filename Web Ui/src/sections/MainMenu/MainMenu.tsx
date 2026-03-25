import {
  Avatar,
  Box,
  Button,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WindowIcon from "@mui/icons-material/Window";
import { ReactElement, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import NavLateralMenu from "./components/LateralMenu";
import LoginComponent from "./components/loginComponent";

type NavLinkConfig = {
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLinkConfig[];
  userRole: string;
}

const NavSpacer = styled(Box)({
  height: 85,
});

const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "85px !important",
  width: "100%",
  maxWidth: 1440,
  margin: "0 auto",
  paddingInline: theme.spacing(4),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    paddingInline: theme.spacing(2),
  },
}));

const LogoLink = styled(NavLink)({
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  color: "#FFFFFF",
  textDecoration: "none",
});

const DesktopNav = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  flex: 1,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const DesktopActionArea = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

function resolveActivePath(pathname: string): string {
  if (pathname.startsWith("/assignment/")) {
    return "/";
  }
  if (pathname.startsWith("/mis-practicas/")) {
    return "/mis-practicas";
  }
  if (pathname.startsWith("/users/group/")) {
    return "/user";
  }

  return pathname;
}

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const activePath = resolveActivePath(location.pathname);
  const settingsLink = navArrayLinks.find(
    (navLink) => navLink.path === "/configuraciones",
  );
  const primaryLinks = navArrayLinks.filter(
    (navLink) => navLink.path !== "/configuraciones",
  );
  const canAccessSettings =
    settingsLink !== undefined && settingsLink.access.includes(userRole);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "#002346",
          boxShadow: "none",
          height: 85,
          justifyContent: "center",
        }}
      >
        <HeaderToolbar>
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <LogoLink to="/">
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "transparent",
                  border: "2px solid #FFFFFF",
                }}
              >
                <WindowIcon fontSize="small" />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                TDDLab
              </Typography>
            </LogoLink>
          </Box>

          <DesktopNav>
            {primaryLinks.map(
              (item) =>
                item.access.includes(userRole) && (
                  <Button
                    key={item.title}
                    component={NavLink}
                    to={item.path}
                    sx={{
                      position: "relative",
                      minWidth: "auto",
                      padding: "10px 24px",
                      borderRadius: 3,
                      color: "#FFFFFF",
                      fontFamily: '"Palanquin Dark", "Inter", sans-serif',
                      fontSize: 20,
                      fontWeight: 600,
                      lineHeight: "36px",
                      letterSpacing: 0,
                      textTransform: "none",
                      "&::after":
                        activePath === item.path
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 20,
                              right: 20,
                              bottom: 6,
                              height: 3,
                              borderRadius: 999,
                              backgroundColor: "#D9D9D9",
                            }
                          : {},
                    }}
                  >
                    {item.title}
                  </Button>
                ),
            )}
          </DesktopNav>

          <DesktopActionArea>
            {canAccessSettings ? (
              <IconButton
                component={NavLink}
                to={settingsLink.path}
                aria-label="Configuraciones"
                sx={{
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                  width: 46,
                  height: 46,
                }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
            ) : null}
            <LoginComponent />
          </DesktopActionArea>

          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
            <LoginComponent compact />
          </Box>
        </HeaderToolbar>
      </AppBar>

      <NavSpacer />

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        <NavLateralMenu
          navArrayLinks={navArrayLinks.filter((item) =>
            item.access.includes(userRole),
          )}
          NavLink={NavLink}
          setOpen={setOpen}
        />
      </Drawer>
    </>
  );
}
