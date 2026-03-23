import { Button } from "@mui/material";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/User-Authentication/domain/authStates";
import React from "react";
import "../styles/loginComponentStyles.css";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useNavigate } from "react-router-dom";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";


export default function LoginComponent() {
  const authData = useGlobalState("authData");
  const navigate = useNavigate();

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
      {!authData[0].userEmail && (
        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{ marginLeft: "18px" }}
        >
          Iniciar sesión
        </Button>
      )}
      {authData[0].userEmail && (
        <React.Fragment>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "#1a1a2e",
              "&:hover": { backgroundColor: "#f0f4ff" },
              "& .MuiListItemIcon-root": { color: "#1a1a2e", minWidth: 40 },
            }}
          >
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText
              primary="Cerrar Sesión"
              primaryTypographyProps={{ fontWeight: 500, fontSize: 15 }}
            />
          </ListItemButton>
         
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
