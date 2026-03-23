import { Dialog, Typography, Button, Box, Zoom } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router-dom";
import "../styles/GroupInvitation.css";

interface AdminAlertModalProps {
  open: boolean;
}

export default function AdminAlertModal({ open }: AdminAlertModalProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/login");
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Zoom}
      PaperProps={{
        className: "gi-admin-modal-paper",
      }}
      BackdropProps={{
        className: "gi-admin-modal-backdrop",
      }}
    >
      <Box
        className="gi-admin-modal-content"
      >
        <WarningAmberRoundedIcon className="gi-admin-modal-icon" />

        <Typography
          variant="h5"
          className="gi-admin-modal-title"
        >
          Acceso restringido
        </Typography>

        <Typography
          variant="body1"
          className="gi-admin-modal-body"
        >
          Este enlace pertenece a un usuario de tipo{" "}
          <strong className="gi-admin-modal-highlight">admin</strong>. <br />
          Serás redirigido al inicio de sesión.
        </Typography>

        <Button
          onClick={handleClose}
          variant="contained"
          className="gi-admin-modal-button"
        >
          Ir al login
        </Button>
      </Box>
    </Dialog>
  );
}
