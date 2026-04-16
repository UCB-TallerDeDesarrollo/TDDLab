import React, { useState } from "react";
import { Button, Menu, MenuItem, Avatar, IconButton, Tooltip } from "@mui/material";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/User-Authentication/domain/authStates";
import "../styles/loginComponentStyles.css";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useNavigate } from "react-router-dom";

export default function LoginComponent() {
  const [authData] = useGlobalState("authData");
  const navigate = useNavigate();
  
  // Estado para controlar la apertura del menú
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = async () => {
    const userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userAccount = await loginPort.userHasAnAccountWithToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userAccount);
    }
  };

  const handleLogout = async () => {
    handleClose(); // Cerrar el menú antes de salir
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
    <React.Fragment>
      {/* Caso: Usuario NO logueado */}
      {!authData.userEmail && (
        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{ marginLeft: "18px" }}
        >
          Iniciar sesión
        </Button>
      )}

      {/* Caso: Usuario logueado */}
      {authData.userEmail && (
        <React.Fragment>
          <Tooltip title="Opciones de cuenta">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                src={authData.userProfilePic} 
                alt="Profile" 
                sx={{ width: 40, height: 40, border: '2px solid #1976d2', marginRight:'50px' }}
              />
            </IconButton>
          </Tooltip>

          <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                disablePadding: true, 
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{
              '& .MuiPaper-root': {
                overflow: 'hidden', 
              }
            }}
            >
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                backgroundColor: '#1976d2',
                color: 'white',             
                fontWeight: 'bold',
                borderRadius: '0',        
                padding: '12px 20px',
                '&:hover': {
                  backgroundColor: '#115293',
                },
              }}
            >
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}