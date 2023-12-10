import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface HandlePopUp {
  handleClose: () => void;
  open: boolean;
  dialogTitle: string;
  dialogContent: React.ReactNode;
  children?: React.ReactNode;
}

function PopUp({
  handleClose,
  open,
  dialogTitle,
  dialogContent,
}: Readonly<HandlePopUp>) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PopUp;
