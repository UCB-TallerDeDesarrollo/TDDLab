import { Dialog, Typography, Button, Box, Zoom } from "@mui/material";
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
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          backgroundColor: "#fdfdfd",
          color: "#2b2b2b",
          borderRadius: "16px",
          p: 4,
          fontFamily: "Inter, Roboto, sans-serif",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
          width: "380px",
          mx: "auto",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0,0,0,0.25)",
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 70, color: "#1976D2" }} />

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            letterSpacing: "0.3px",
          }}
        >
          Acceso restringido
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: 300,
            fontSize: "0.95rem",
            color: "#4b4b4b",
            lineHeight: 1.6,
          }}
        >
          Este enlace pertenece a un usuario de tipo{" "}
          <strong style={{ color: "#1976D2" }}>admin</strong>. <br />
          Serás redirigido al inicio de sesión.
        </Typography>

        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            mt: 3,
            px: 4,
            py: 1.2,
            fontWeight: "bold",
            borderRadius: "12px",
            textTransform: "none",
            backgroundColor: "#1976D2",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          Ir al login
        </Button>
      </Box>
    </Dialog>
  );
}
