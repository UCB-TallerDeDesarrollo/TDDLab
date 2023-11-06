import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../firebaseConfig";
import SuccessfulSignUpPopUp from "./components/SuccessfulSignUpPopUp";
import SuccessfulEnrollmentPopUp from "./components/SuccessfulEnrollmentPopUp";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import { GithubAuthPort } from "../../modules/Auth/application/GithubAuthPort";

const AuthComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const githubAuthPort = new GithubAuthPort();
  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const [showPopUp, setShowPopUp] = useState(false);

  const handleAcceptInvitation = () => {
    setShowPopUp(true);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.displayName}</p>
          <img
            src={user.photoURL ?? "URL_POR_DEFECTO"}
            alt={user.displayName ?? "Usuario"}
          />
          <Button onClick={githubAuthPort.handleSignOut}>Cerrar sesión</Button>
          <Button onClick={handleAcceptInvitation}>
            Aceptar invitación al curso
          </Button>
          {showPopUp && <SuccessfulEnrollmentPopUp></SuccessfulEnrollmentPopUp>}
        </div>
      ) : (
        <Button
          color="primary"
          aria-label="GitHub"
          onClick={githubAuthPort.handleSignInWithGitHub}
        >
          <GitHubIcon></GitHubIcon>
          Iniciar Sesión
        </Button>
      )}

      {user && (
        <SuccessfulSignUpPopUp
          photoAccount={user.photoURL}
          nameAccount={user.displayName}
        ></SuccessfulSignUpPopUp>
      )}
    </div>
  );
};

export default AuthComponent;
