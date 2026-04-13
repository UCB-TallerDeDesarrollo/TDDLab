import { useState, MouseEvent } from "react";
import { Button, Menu, MenuItem, Avatar, ListItemIcon, Divider } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setGlobalState, useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";

import "../styles/loginComponentStyles.css";

export default function LoginComponent() {
  const authData = useGlobalState("authData");
  const navigate = useNavigate();
  
  // Estado para el menú desplegable
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Lógica de Login original
  const handleLogin = async () => {
    const userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userAccount = await loginPort.userHasAnAccountWithToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userAccount);
    }
  };

  // Lógica de Logout original (Integrada)
  const handleLogoutAction = async () => {
    handleClose(); // Cerrar el menú
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

  return (
    <div className="user-profile-group">
      {authData[0].userEmail ? (
        <>
          <Avatar
            src={authData[0].userProfilePic}
            alt="Profile"
            onClick={handleClick}
            sx={{ width: 45, height: 45, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock={true} // Evita que la pantalla salte al abrir el menú
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 3,
                sx: { 
                  mt: 1.5,
                  overflow: 'visible',
                  '&:before': {
                    content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 
                  } 
                }
              }
            }}
          >
            <MenuItem disabled sx={{ fontSize: '0.8rem' }}>
              {authData[0].userEmail}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutAction} sx={{ color: '#d32f2f' }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#d32f2f' }} />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button onClick={handleLogin} className="btn-std btn-primary">
          Iniciar sesión
        </Button>
      )}
    </div>
  );
}