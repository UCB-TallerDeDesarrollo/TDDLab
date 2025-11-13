import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import {VITE_API} from "../../../../config.ts";

import { useEffect, useState } from "react";
import axios from "axios";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useNavigate } from "react-router-dom";
import { getAuth, type User } from "firebase/auth";
import firebase from "../../../firebaseConfig";

interface SuccessfulEnrollmentPopUpProps {
  authProvider?: "github" | "google" | null;
}

function SuccessfulEnrollmentPopUp({ authProvider = null }: SuccessfulEnrollmentPopUpProps) {
  const isFirebaseUser = (data: unknown): data is User => {
    return (
      !!data &&
      typeof data === "object" &&
      "email" in (data as Record<string, unknown>) &&
      "getIdToken" in (data as Record<string, unknown>)
    );
  };

  const [open, setOpen] = React.useState(true);
  const [groupName, setGroupName] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClose = async () => {
    setOpen(false);
    
    // Verificar si el usuario ya está autenticado
    const auth = getAuth(firebase);
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // Usuario ya autenticado, usar ese usuario
      try {
        const idToken = await currentUser.getIdToken();
        const loginPort = new CheckIfUserHasAccount();
        
        // Usar el método correcto según el proveedor
        let userCourse;
        if (authProvider === "google") {
          userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
        } else {
          userCourse = await loginPort.userHasAnAccountWithToken(idToken);
        }
        
        if (userCourse) {
          setCookieAndGlobalStateForValidUser(currentUser, userCourse, () =>
            navigate({
              pathname: "/",
            }),
          );
          if (currentUser.photoURL) {
            localStorage.setItem("userProfilePic", currentUser.photoURL);
          }
          window.location.href = "/";
        } else {
          alert("Disculpa, tu usuario no esta registrado");
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        alert("Error al iniciar sesión. Por favor intenta nuevamente.");
      }
    } else {
      // Usuario no autenticado, intentar autenticar según el proveedor
      let userData;
      if (authProvider === "google") {
        userData = await handleSignInWithGoogle();
      } else {
        userData = await handleSignInWithGitHub();
      }
      
      if (isFirebaseUser(userData)) {
        try {
          const idToken = await userData.getIdToken();
          const loginPort = new CheckIfUserHasAccount();
          
          let userCourse;
          if (authProvider === "google") {
            userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
          } else {
            userCourse = await loginPort.userHasAnAccountWithToken(idToken);
          }
          
          if (userCourse) {
            setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
              navigate({
                pathname: "/",
              }),
            );
            if (userData.photoURL) {
              localStorage.setItem("userProfilePic", userData.photoURL);
            }
            window.location.href = "/";
          } else {
            alert(
              "Tu cuenta todavía no está registrada en TDDLab. Completa tu invitación o solicita acceso a un administrador."
            );
          }
        } catch (error) {
          alert(
            "Tu cuenta todavía no está registrada en TDDLab. Completa tu invitación o solicita acceso a un administrador."
          );
        }
      } else {
        // userData es null, el usuario canceló o hubo un error
        // Los mensajes ya se mostraron en las funciones de signIn
      }
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("groupid");

    if (groupId) {
      // Realizar una solicitud a la API para obtener el nombre del grupo
      axios.get(`${VITE_API}/groups/${groupId}`)
        .then(response => {
          setGroupName(response.data.groupName);
        })
        .catch(error => {
          console.error("Error al obtener el nombre del grupo:", error);
        });
    }
  }, []);


  const dialogContent: React.ReactNode = (
    <DialogContentText>
      Ahora eres parte del grupo {groupName}.
      Ya puedes aprender y mejorar tus skills de programación con las tareas del curso.
    </DialogContentText>
  );

  return (
    <div>
      <PopUp
        handleClose={handleClose}
        open={open}
        dialogTitle="Inscripción Exitosa"
        dialogContent={dialogContent}
      ></PopUp>
    </div>
  );
}

export default SuccessfulEnrollmentPopUp;