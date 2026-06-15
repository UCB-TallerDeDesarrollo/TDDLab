import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";
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
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    paddingInline: theme.spacing(2),
  },
}));

const LogoLink = styled(NavLink)({
  display: "inline-flex",
  alignItems: "center",
  gap: 14,
  color: "#FFFFFF",
  textDecoration: "none",
  minWidth: 0,
});

const DesktopNav = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2.5),
  flex: "1 1 0%",
  minWidth: 0, // allow to shrink on small screens so right actions don't get pushed
  overflow: "hidden",
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const DesktopActionArea = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexShrink: 0, // keep actions from being squeezed
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

function resolveActivePath(pathname: string): string {
  if (pathname.startsWith("/assignment/")) {
    return "/tareas";
  }
  if (pathname.startsWith("/mis-practicas/")) {
    return "/mis-practicas";
  }
  if (pathname.startsWith("/users/group/")) {
    return "/user";
  }

  return pathname;
}

function getDisplayTitle(title: string): string {
  const map: Record<string, string> = {
    Inicio: "INICIO",
    Grupos: "GRUPOS",
    Tareas: "TAREAS",
    "Mis Practicas": "MIS PRÁCTICAS",
    Usuarios: "USUARIOS",
  };

  return map[title] ?? title.toUpperCase();
}

function getUnderlineWidth(title: string): number {
  const widths: Record<string, number> = {
    Inicio: 72,
    "Mis Practicas": 145,
    Usuarios: 100,
    Grupos: 81,
  };
  return widths[title] ?? 66;
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
  const isSettingsActive = activePath === settingsLink?.path;
  const primaryLinks = navArrayLinks.filter(
    (navLink) => navLink.path !== "/configuraciones",
  );
  const canAccessSettings =
    settingsLink?.access.includes(userRole) ?? false;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "#002346",
          boxShadow: "none",
          height: 85,
          justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <HeaderToolbar>
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, flex: '0 0 auto' }}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", lg: "none" }, mr: 1, flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>

            <LogoLink to="/">
              <img src="/Logo.png" alt="TDDLab Logo" style={{ maxHeight: "40px", maxWidth: "100%", objectFit: "contain", objectPosition: "left center" }} />
            </LogoLink>
          </Box>

          <DesktopNav>
            {primaryLinks.map(
              (item) =>
                item.access.includes(userRole) ? (
                  <Button
                    key={item.title}
                    component={NavLink}
                    to={item.path}
                    sx={{
                      position: "relative",
                      minWidth: 0,
                      padding: { xs: "4px 6px", sm: "6px 10px", md: "10px 24px" },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderRadius: 3,
                      color: "#FFFFFF",
                      fontFamily: '"Palanquin Dark", "Inter", sans-serif',
                      fontSize: { xs: 12, sm: 14, md: 20 },
                      fontWeight: 600,
                      lineHeight: "36px",
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                      transition: "background-color 0.2s ease, transform 0.1s",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.08)",
                        transform: "scale(1.02)",
                      },
                      "&.active": {
                        backgroundColor: "transparent",
                        transform: "scale(1.02)",
                      },
                      "&::after":
                        activePath === item.path
                          ? {
                              content: '""',
                              position: "absolute",
                              left: "50%",
                              transform: "translateX(-50%)",
                              bottom: 6,
                              width: getUnderlineWidth(item.title),
                              height: 3,
                              borderRadius: 8,
                              backgroundColor: "#D9D9D9",
                            }
                          : {},
                    }}
                  >
                    {getDisplayTitle(item.title)}
                  </Button>
                ) : null,
            )}
          </DesktopNav>

          <DesktopActionArea>
            {canAccessSettings ? (
              <IconButton
                component={NavLink}
                to={settingsLink?.path ?? "/configuraciones"}
                aria-label="Configuraciones"
                sx={{
                  color: "#FFFFFF",
                  width: 40,
                  height: 40,
                  mr: 1,
                  borderRadius: 2,
                  position: 'relative',
                  transition: "background-color 0.2s ease, transform 0.1s",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    transform: "scale(1.02)",
                  },
                  "&.active": {
                    backgroundColor: "transparent",
                    transform: "scale(1.02)",
                  },
                  "&::after":
                    isSettingsActive
                      ? {
                          content: '""',
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: 6,
                          width: 20,
                          height: 3,
                          borderRadius: 8,
                          backgroundColor: "#D9D9D9",
                        }
                      : {},
                }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
            ) : null}
            <LoginComponent />
          </DesktopActionArea>

          <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", flexShrink: 0 }}>
            <LoginComponent compact />
          </Box>
        </HeaderToolbar>
      </AppBar>

      <NavSpacer />

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", lg: "none" } }}
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
