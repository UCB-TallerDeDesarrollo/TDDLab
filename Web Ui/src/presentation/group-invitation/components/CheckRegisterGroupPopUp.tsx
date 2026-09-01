import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import { useNavigate } from "react-router-dom";

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate("/login");
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