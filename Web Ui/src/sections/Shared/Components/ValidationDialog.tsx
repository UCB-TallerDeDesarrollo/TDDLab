import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../../../App.css";

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
  return (
    <Dialog open={open}>
      <DialogTitle className="dialog-title-std">{title}</DialogTitle>
      <DialogActions className="dialog-footer">
        <Button
          onClick={onClose}
          className="dialog-footer"
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
