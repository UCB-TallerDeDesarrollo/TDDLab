import { Button } from "@mui/material";
import { GithubAuthPort } from "../../../modules/Auth/application/GithubAuthPort";
import { LoginPort } from "../../../modules/Auth/application/LoginPort";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/Auth/domain/authStates";
import React from "react";
import "../styles/loginComponentStyles.css";
export default function LoginComponent() {
  const authData = useGlobalState("authData");

  const handleLogin = async () => {
    const githbAuthPort = new GithubAuthPort();
    let userData = await githbAuthPort.handleSignInWithGitHub();
    if (userData?.email) {
      const loginPort = new LoginPort();
      let userCourse = await loginPort.userHasAnAcount(userData.email);
      if (userCourse && userData.photoURL) {
        setGlobalState("authData", {
          userProfilePic: userData.photoURL,
          userEmail: userData.email,
          userCourse: userCourse,
        });
      } else {
        console.log("Invalid User");
      }
    }
  };
  const handleLogout = async () => {
    const githbAuthPort = new GithubAuthPort();
    await githbAuthPort.handleSignOut();
    setGlobalState("authData", {
      userProfilePic: "",
      userEmail: "",
      userCourse: "",
    });
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
