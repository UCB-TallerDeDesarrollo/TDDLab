import { Dialog, Typography, Button, Box } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router-dom";

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
      PaperProps={{
        sx: {
          backgroundColor: "white",
          color: "black",
          textAlign: "center",
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
          padding: 3,
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ p: 2 }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 60, color: "rgb(25, 118, 210)" }} />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Acceso de administrador
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 300 }}>
          Este enlace pertenece a un usuario de tipo <strong>admin</strong>.
          Serás redirigido al inicio de sesión.
        </Typography>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "white",
            color: "rgb(25, 118, 210)",
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          Ir al Login
        </Button>
      </Box>
    </Dialog>
  );
}