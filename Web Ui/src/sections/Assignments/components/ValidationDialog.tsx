import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface ValidationDialogProps {
  // Change the interface name
  open: boolean;
  title: string;
  content: string;
  closeText: string; // Change "cancelText" to "closeText"
  onClose: () => void;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  // Change the component name and props
  open,
  title,
  closeText, // Change "cancelText" to "closeText"
  onClose, // Change "onCancel" to "onClose"
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
        <Button
          onClick={onClose} // Change "onCancel" to "onClose"
          color="primary"
          style={dialogContentStyle}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
