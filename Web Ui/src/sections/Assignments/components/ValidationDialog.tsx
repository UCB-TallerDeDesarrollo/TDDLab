import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface ValidationDialogProps {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  title,
  closeText,
  onClose,
}) => {
  const dialogContentStyle = {
    fontFamily: "Roboto",
    fontSize: "15px",
  };
  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    fontFamily: "Roboto",
  };

  return (
    <Dialog open={open}>
      <DialogTitle style={titleStyle}>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onClose} color="primary" style={dialogContentStyle}>
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
