import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../Styles/sharedStyles.css";
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
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle className="shared-dialog-title">
        {title}
      </DialogTitle>

      <DialogContent className="shared-dialog-content">
        <div className="shared-dialog-text">
          {content}
        </div>
      </DialogContent>

      <DialogActions className="shared-dialog-footer">
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