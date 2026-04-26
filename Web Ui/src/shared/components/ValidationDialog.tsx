import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  dialogContentStyle,
  primaryButtonStyle,
  titleStyle2,
} from "../../sections/Shared/Styles/DialogBoxStyles";

interface ValidationDialogProps {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
}

function ValidationDialog({
  open,
  title,
  closeText,
  onClose,
}: Readonly<ValidationDialogProps>) {
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
}

export default ValidationDialog;
