import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface FeedbackSnackbarProps {
  message: string;
  onClose: () => void;
  open: boolean;
  severity?: "success" | "error" | "info" | "warning";
}

function FeedbackSnackbar({
  message,
  onClose,
  open,
  severity = "success",
}: Readonly<FeedbackSnackbarProps>) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default FeedbackSnackbar;
