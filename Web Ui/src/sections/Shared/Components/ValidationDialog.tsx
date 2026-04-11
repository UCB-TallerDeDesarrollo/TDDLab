import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "../Styles/sharedStyles.css";
import "../../../App.css";

interface ValidationDialogProps {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
  isError?: boolean;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  title,
  closeText,
  onClose,
  isError,
}) => {
  const showAsError = isError ?? title.toLowerCase().startsWith("error");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        className={showAsError ? "dialog-title-error" : "dialog-title-success"}
      >
        {showAsError ? (
          <ErrorOutlineIcon fontSize="small" />
        ) : (
          <CheckCircleOutlineIcon fontSize="small" />
        )}
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
