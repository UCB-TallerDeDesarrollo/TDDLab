import { Button, Box, Drawer, AppBar, IconButton, Toolbar } from "@mui/material";
import { ReactElement, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom"; 
import MenuIcon from "@mui/icons-material/Menu";
import NavLateralMenu from "./components/LateralMenu";
import LoginComponent from "./components/loginComponent";

import { useGlobalState, setGlobalState } from "../../modules/User-Authentication/domain/authStates";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { removeSessionCookie } from "../../modules/User-Authentication/application/deleteSessionCookie";

import logoTddLab from "../../assets/logo-tddlab.svg";
import "../../App.css";
import "../MainMenu/styles/MainMenuStyles.css" 

type NavLinkType = { 
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLinkType[];
  userRole: string;
}

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // ESTADO PARA EL MODAL DE LOGIN
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  const authData = useGlobalState("authData"); 
  const isLanding = !authData[0].userEmail || authData[0].userEmail === "";

  const isActive = (item: any) => {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);
    const source = params.get("source");

    if (pathname === "/graph" || pathname === "/asistente-ia") {
      if (item.path === "/assignments") return source === "assignment";
      if (item.path === "/mis-practicas") return source === "practice";
    }
    if (item.path === "/assignments") return pathname.startsWith("/assignments") || pathname.startsWith("/assignment");
    if (item.path === "/mis-practicas") return pathname.startsWith("/mis-practicas");

    return pathname.startsWith(item.path);
  };

  const handleLogoutAction = async () => {
    await handleGithubSignOut();
    setGlobalState("authData", { userid: -1, userProfilePic: "", userEmail: "", usergroupid: -1, userRole: "", });
    await removeSessionCookie();
    localStorage.clear();
    setOpen(false); 
    navigate("/login");
  };

  return (
    // Si es landing, no aplicamos el spacer para que el Hero pegue arriba
    <div className={isLanding ? "" : "page-top-spacer"}>
      <AppBar 
        position="fixed" 
        className={`main-navbar ${isLanding ? "navbar-landing" : ""}`} 
        elevation={0}
      >
        <Toolbar className="navbar-toolbar">
          <div className="navbar-brand-group">
            <IconButton
              color="inherit"
              onClick={() => setOpen(true)}
              className="mobile-menu-btn"
            >
              <MenuIcon />
            </IconButton>
            <NavLink to="/" className="navbar-brand-link">
              <img src={logoTddLab} alt="TDDLab Logo" className="navbar-logo" />
            </NavLink>
          </div>

          <div className="navbar-actions-group">
            <Box className="desktop-nav-links">
              {/* Solo mostramos links si NO es landing */}
              {!isLanding && navArrayLinks.map((item) =>
                item.access.includes(userRole) && (
                  <Button
                    key={item.title}
                    component={NavLink}
                    to={item.path}
                    className={`nav-link-btn ${isActive(item) ? "nav-link-active" : ""}`}
                  >
                    {item.title}
                  </Button>
                )
              )}
            </Box>
            
            {/* PASAMOS EL ESTADO AL COMPONENTE DE LOGIN */}
            <LoginComponent 
              loginModalOpen={loginModalOpen} 
              setLoginModalOpen={setLoginModalOpen} 
            />
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        className="main-drawer"
      >
        <NavLateralMenu
          navArrayLinks={navArrayLinks}
          NavLink={NavLink}
          setOpen={setOpen}
          userEmail={authData[0].userEmail ?? ""} 
          userRole={userRole}
          onLogout={handleLogoutAction}
          // PASAMOS LA FUNCIÓN PARA ABRIR DESDE EL MÓVIL
          onLoginOpen={() => setLoginModalOpen(true)}
        />
      </Drawer>
    </div>
  );
}