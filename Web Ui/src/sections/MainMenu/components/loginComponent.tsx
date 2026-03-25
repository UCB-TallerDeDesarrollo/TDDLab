import { Avatar, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/User-Authentication/domain/authStates";

interface LoginComponentProps {
  compact?: boolean;
}

export default function LoginComponent({
  compact = false,
}: Readonly<LoginComponentProps>) {
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
      {!authData[0].userEmail ? (
        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{
            marginLeft: compact ? 0 : "18px",
            textTransform: "none",
            borderRadius: 999,
            bgcolor: "#1370D2",
            boxShadow: "none",
            px: compact ? 2 : 2.5,
            minWidth: compact ? "auto" : undefined,
          }}
        >
          Iniciar sesi{"\u00f3"}n
        </Button>
      ) : (
        <React.Fragment>
          <Button
            onClick={handleLogout}
            variant={compact ? "text" : "outlined"}
            sx={{
              marginLeft: compact ? 0 : "18px",
              textTransform: "none",
              borderRadius: 999,
              color: "#FFFFFF",
              borderColor: "rgba(255,255,255,0.25)",
              minWidth: compact ? "auto" : undefined,
              px: compact ? 1.25 : 2,
            }}
          >
            Salir
          </Button>
          <Avatar
            src={authData[0].userProfilePic}
            alt="Profile Picture"
            sx={{
              width: compact ? 36 : 50,
              height: compact ? 36 : 50,
              ml: 1,
              border: "2px solid rgba(255,255,255,0.24)",
            }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
