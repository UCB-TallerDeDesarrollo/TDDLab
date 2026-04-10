import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../Styles/sharedStyles.css";
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="shared-dialog-title">
        Confirmación
      </DialogTitle>

      <DialogContent className="shared-dialog-content">
        <div className="shared-dialog-text">{title}</div>
      </DialogContent>

      <DialogActions className="shared-dialog-footer">
        <Button
          onClick={onClose}
          className="btn-std btn-primary"
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};