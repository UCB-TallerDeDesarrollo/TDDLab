import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import {VITE_API} from "../../../../config.ts";

import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import firebase from "../../../firebaseConfig";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount.ts";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser.ts";
import { useNavigate } from "react-router-dom";

interface SuccessfulEnrollmentPopUpProps {
  authProvider?: "github" | "google" | null;
}

function SuccessfulEnrollmentPopUp({ authProvider = null }: SuccessfulEnrollmentPopUpProps) {
  const [open, setOpen] = React.useState(true);
  const [groupName, setGroupName] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClose = async () => {
    setOpen(false);
    
    const auth = getAuth(firebase);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      alert("Disculpa, tu usuario no esta registrado");
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      
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
      alert("Disculpa, tu usuario no esta registrado");
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


  const dialogContent: any = (
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