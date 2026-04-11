import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title-success">
        <CheckCircleOutlineIcon fontSize="small" />
        {title}
      </DialogTitle>

      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="btn-std btn-primary">
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
