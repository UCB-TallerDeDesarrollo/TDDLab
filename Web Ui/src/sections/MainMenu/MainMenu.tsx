import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
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
  gap: 14,
  color: "#FFFFFF",
  textDecoration: "none",
});

const LogoMark = styled(Box)({
  position: "relative",
  width: 30,
  height: 30,
  transform: "rotate(45deg)",
  display: "grid",
  gridTemplateColumns: "repeat(3, 8px)",
  gridTemplateRows: "repeat(3, 8px)",
  gap: 3,
  "& span": {
    display: "block",
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
});

const LogoText = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  lineHeight: 1,
});

const DesktopNav = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2.5),
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
          borderBottom: "1px solid rgba(255,255,255,0.12)",
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
              <LogoMark aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </LogoMark>
              <LogoText>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: 0.4,
                    lineHeight: "18px",
                  }}
                >
                  TDD
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 10,
                    letterSpacing: 6,
                    lineHeight: "12px",
                    pl: "1px",
                  }}
                >
                  LAB
                </Typography>
              </LogoText>
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
                      minWidth: "auto",
                      padding: "10px 24px",
                      borderRadius: 3,
                      color: "#FFFFFF",
                      fontFamily: '"Palanquin Dark", "Inter", sans-serif',
                      fontSize: 20,
                      fontWeight: 600,
                      lineHeight: "36px",
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                      transition: "background 0.2s ease, transform 0.1s",
                      "&:hover, &.active": {
                        background: "linear-gradient(180deg, #002346 0%, #004589 100%)",
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
                              width:
                                item.title === "Inicio"
                                  ? 72
                                  : item.title === "Mis Practicas"
                                  ? 145
                                  : item.title === "Usuarios"
                                    ? 100
                                    : item.title === "Grupos"
                                      ? 81
                                      : 66,
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
                to={settingsLink.path}
                aria-label="Configuraciones"
                sx={{
                  color: "#FFFFFF",
                  width: 40,
                  height: 40,
                  mr: 1,
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
