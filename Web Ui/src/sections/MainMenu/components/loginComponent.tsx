import { Button } from "@mui/material";
import { CheckIfUserHasAccount } from "../../../modules/Users-Authentication/application/checkIfUserHasAccount";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/Users-Authentication/domain/authStates";
import React from "react";
import "../styles/loginComponentStyles.css";
import { removeSessionCookie } from "../../../modules/Users-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/Users-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../../modules/Users-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/Users-Authentication/application/setCookieAndGlobalStateForValidUser";

export default function LoginComponent() {
  const authData = useGlobalState("authData");

  const handleLogin = async () => {
    let userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const loginPort = new CheckIfUserHasAccount();
      let userCourse = await loginPort.userHasAnAcount(userData.email);
      setCookieAndGlobalStateForValidUser(userData, userCourse);
    }
  };
  const handleLogout = async () => {
    await handleGithubSignOut();
    setGlobalState("authData", {
      userProfilePic: "",
      userEmail: "",
      userCourse: "",
    });
    removeSessionCookie();
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
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{ marginLeft: "18px" }}
          >
            Cerrar Sesion
          </Button>
          <img
            src={authData[0].userProfilePic}
            alt="Profile Picture"
            className="profilePicture"
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
