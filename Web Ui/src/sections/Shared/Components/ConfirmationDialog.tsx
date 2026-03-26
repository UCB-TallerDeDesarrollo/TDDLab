import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  dialogContentStyle,
  titleStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../Styles/DialogBoxStyles";

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
    <Dialog open={open}>
      <DialogTitle style={titleStyle}>{title}</DialogTitle>
      <DialogContent style={dialogContentStyle}>{content}</DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="primary"
          sx={{ 
            ...dialogContentStyle, 
            ...secondaryButtonStyle, 
            color: '#d32f2f',
            borderColor: '#d32f2f',
            borderWidth: '2px',
            borderStyle: 'solid',
            padding: '5px 20px',
            transition: "all 0.175s ease-out",
            "&:hover": {
              filter: "brightness(0.9)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
            "&:active": {
              transform: "scale(0.97)",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onDelete}
          color="primary"
          sx={{ 
            ...dialogContentStyle, 
            ...primaryButtonStyle,
            transition: "all 0.175s ease-out",
            "&:hover": {
              filter: "brightness(0.9)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
            "&:active": {
              transform: "scale(0.97)",
            },
          }}
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
