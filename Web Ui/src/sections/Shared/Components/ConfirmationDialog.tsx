import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../../../App.css";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
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
  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title-std">
        {title}
      </DialogTitle>
      
      <DialogContent className="dialog-content-box">
        <div className="dialog-text-content">
          {content}
        </div>
      </DialogContent>

      <DialogActions className="dialog-footer">
        <Button
          onClick={onCancel}
          className="btn-std btn-danger-outline"
        >
          {cancelText}
        </Button>

        <Button
          onClick={onDelete}
          className="btn-std btn-primary"
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};