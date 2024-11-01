import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import {VITE_API} from "../../../../config.ts";

import { useEffect, useState } from "react";
import axios from "axios";

function SuccessfulEnrollmentPopUp() {
  const [open, setOpen] = React.useState(true);
  const [groupName, setGroupName] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
    window.location.href = "/";
    console.log(open);
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