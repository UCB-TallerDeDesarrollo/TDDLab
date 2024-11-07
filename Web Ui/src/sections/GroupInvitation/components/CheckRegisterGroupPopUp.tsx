import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    window.location.href = "/";
    console.log(open);
  };

  const dialogContent: any = (
    <DialogContentText>
        Ya estas registrado en este grupo.
    </DialogContentText>
  );

  return (
    <div>
      <PopUp
        handleClose={handleClose}
        open={open}
        dialogTitle="Vaya"
        dialogContent={dialogContent}
      ></PopUp>
    </div>
  );
}

export default CheckRegisterGroupPopUp;