import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  dialogContentStyle,
  titleStyle2,
  primaryButtonStyle,
} from "../Styles/DialogBoxStyles";

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
      <DialogTitle style={titleStyle2}>{title}</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          style={{ ...dialogContentStyle, ...primaryButtonStyle }}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
