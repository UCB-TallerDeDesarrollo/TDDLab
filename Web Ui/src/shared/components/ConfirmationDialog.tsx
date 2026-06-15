import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  destructiveButtonStyle,
  dialogContentStyle,
  neutralButtonStyle,
  titleStyle,
} from "../styles/DialogBoxStyles";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
  cancelText: string;
  deleteText: string;
  onCancel: () => void;
  onDelete: () => void;
}

function ConfirmationDialog({
  open,
  title,
  content,
  cancelText,
  deleteText,
  onCancel,
  onDelete,
}: Readonly<ConfirmationDialogProps>) {
  return (
    <Dialog open={open}>
      <DialogTitle style={titleStyle}>{title}</DialogTitle>
      <DialogContent style={dialogContentStyle}>{content}</DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          style={{ ...dialogContentStyle, ...neutralButtonStyle }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onDelete}
          style={{ ...dialogContentStyle, ...destructiveButtonStyle }}
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
