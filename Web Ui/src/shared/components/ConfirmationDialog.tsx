import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  dialogContentStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  titleStyle,
} from "../../sections/Shared/Styles/DialogBoxStyles";

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
          color="primary"
          style={{
            ...dialogContentStyle,
            ...secondaryButtonStyle,
            color: "#d32f2f",
            borderColor: "#d32f2f",
            borderWidth: "2px",
            borderStyle: "solid",
            padding: "5px 20px",
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onDelete}
          color="primary"
          style={{ ...dialogContentStyle, ...primaryButtonStyle }}
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
