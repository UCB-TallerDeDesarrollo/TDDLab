import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const dialogContent = (
    <DialogContentText>
      Ya estás registrado en este grupo.
    </DialogContentText>
  );

  return (
    <div>
      <PopUp
        handleClose={handleClose}
        open={open}
        dialogTitle="Vaya"
        dialogContent={dialogContent}
      />
    </div>
  );
}

export default CheckRegisterGroupPopUp;