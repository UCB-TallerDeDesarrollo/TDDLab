import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";

function SuccessfulEnrollmentPopUp() {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    window.location.href = "/";
    console.log(open);
  };

  const dialogContent: React.ReactNode = (
    <DialogContentText>
      Ahora eres parte del Curso "TDD II-2023 de Ingeniería de Software". Ya
      puedes aprender y mejorar tus skills de programación con las tareas del
      curso.
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
