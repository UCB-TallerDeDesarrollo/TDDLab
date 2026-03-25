import {
  Button,
  Box,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import NavLateralMenu from "./components/LateralMenu";
import MenuIcon from "@mui/icons-material/Menu";
import { ReactElement, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { setGlobalState, useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import TDDLabLogo from "./components/TDDLabLogo";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { removeSessionCookie } from "../../modules/User-Authentication/application/deleteSessionCookie";

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const authData = useGlobalState("authData")[0];

  const isProfileMenuOpen = Boolean(profileMenuAnchor);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await handleGithubSignOut();
    setGlobalState("authData", {
      userid: -1,
      userProfilePic: "",
      userEmail: "",
      usergroupid: -1,
      userRole: "",
    });
    await removeSessionCookie();
    localStorage.clear();
    navigate("/login");
  };

  const activeButton = navArrayLinks.find(
    (navLink) => navLink.path === location.pathname
  )?.title;

  const navButtons = navArrayLinks.filter(
    (item) => item.title !== "Configuraciones" && item.access.includes(userRole)
  );

  const settingsLink = navArrayLinks.find((item) => item.title === "Configuraciones");

  const displayLabelMap: Record<string, string> = {
    Grupos: "GRUPOS",
    Tareas: "TAREAS",
    "Mis Practicas": "MIS PRÁCTICAS",
    Usuarios: "USUARIOS",
  };

  return (
    <div style={{ marginTop: "100px" }}>
      <Box
        sx={{
          position: "fixed",
          zIndex: 1200,
          top: 0,
          left: 0,
          right: 0,
          height: "85px",
          backgroundColor: "#002346",
        }}
      >
        <Box
          sx={{
            maxWidth: "1440px",
            width: "100%",
            height: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: "fit-content" }}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "flex", md: "none" }, color: "#FFFFFF", mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <TDDLabLogo compact />
            </NavLink>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "flex-end",
              gap: { md: 0.5, lg: 1 },
              flex: 1,
              minWidth: 0,
              mr: 1,
            }}
          >
            {navButtons.map((item) => (
              <Button
                key={item.title}
                component={NavLink}
                to={item.path}
                sx={{
                  height: "56px",
                  minWidth: { md: "116px", lg: "131px" },
                  width: "auto",
                  borderRadius: "12px",
                  px: { md: 1.5, lg: "25px" },
                  py: "10px",
                  textTransform: "none",
                  fontFamily: "'Palanquin Dark', sans-serif",
                  fontWeight: 600,
                  fontSize: { md: "18px", lg: "20px" },
                  lineHeight: { md: "30px", lg: "36px" },
                  letterSpacing: 0,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: "4px",
                    width: { md: "112px", lg: "145px" },
                    maxWidth: "calc(100% - 16px)",
                    height: "3px",
                    borderRadius: "8px",
                    backgroundColor:
                      activeButton === item.title ? "#D9D9D9" : "transparent",
                  },
                }}
              >
                {displayLabelMap[item.title] ?? item.title.toUpperCase()}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            {settingsLink && settingsLink.access.includes(userRole) && (
              <IconButton
                component={NavLink}
                to={settingsLink.path}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  p: 0.5,
                  borderRadius: "10px",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                  "&:hover img": {
                    opacity: 1,
                    filter: "drop-shadow(0 0 6px rgba(19, 112, 210, 0.95))",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/config.png"
                  alt="Configuraciones"
                  sx={{
                    width: "24px",
                    height: "24px",
                    display: "block",
                    transition: "opacity 0.2s ease, filter 0.2s ease",
                  }}
                />
              </IconButton>
            )}

            {authData.userEmail && (
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
                aria-controls={isProfileMenuOpen ? "profile-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen ? "true" : undefined}
              >
                <Box
                  component="img"
                  src={authData.userProfilePic}
                  alt="Profile Picture"
                  sx={{
                    width: { xs: "44px", md: "61px" },
                    height: { xs: "44px", md: "61px" },
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "#D9D9D9",
                    cursor: "pointer",
                  }}
                />
              </IconButton>
            )}

            <Menu
              id="profile-menu"
              anchorEl={profileMenuAnchor}
              open={isProfileMenuOpen}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.8,
                    minWidth: "152px",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <MenuItem
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Cerrar sesion
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", md: "none" } }}
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
