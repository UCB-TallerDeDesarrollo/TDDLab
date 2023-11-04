import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: string;
  cancelText: string;
  deleteText: string;
  onCancel: () => void;
  onDelete: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  cancelText,
  deleteText,
  onCancel,
  onDelete,
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
      <DialogContent style={dialogContentStyle}>{content}</DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="primary"
          style={dialogContentStyle}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onDelete}
          color="primary"
          style={dialogContentStyle}
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
