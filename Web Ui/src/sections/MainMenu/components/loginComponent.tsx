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
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
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

  const handleLogoutAction = async () => {
    handleClose();
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
            className="user-avatar"
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock={true}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { className: 'user-menu-paper' } }}
          >
            <MenuItem disabled className="user-menu-email">
              {authData[0].userEmail}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutAction} className="logout-menu-item">
              <ListItemIcon>
                <Logout className="logout-icon-red" />
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