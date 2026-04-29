import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Warning, CheckCircle } from "@mui/icons-material";
import { styles } from "../styles/Form.styles";

interface ValidationDialogProps {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
}

const ValidationDialog = ({ open, title, closeText, onClose }: ValidationDialogProps) => {
  const isError = title.toLowerCase().includes("error");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          ...styles.validationDialog.title.base,
          ...(isError
            ? styles.validationDialog.title.error
            : styles.validationDialog.title.success),
        }}
      >
        {isError ? (
          <Warning sx={styles.validationDialog.icon.error} />
        ) : (
          <CheckCircle sx={styles.validationDialog.icon.success} />
        )}
        {title}
      </DialogTitle>
      <DialogActions sx={styles.validationDialog.actions}>
        <Button
          onClick={onClose}
          style={
            isError
              ? styles.validationDialog.closeButton.error
              : styles.validationDialog.closeButton.success
          }
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationDialog;