import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useSafariStorage } from "../hooks/useSafariStorage";
import {
  dialogContentStyle,
  neutralButtonStyle,
  primaryButtonStyle,
  titleStyle,
} from "../styles/DialogBoxStyles";

export default function SafariStorageModal() {
  const { open, retryFailed, retry, close } = useSafariStorage();

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="safari-storage-title"
      aria-describedby="safari-storage-description"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle id="safari-storage-title" style={titleStyle}>
        Activa las cookies en Safari
      </DialogTitle>
      <DialogContent sx={{ "& .MuiTypography-root": dialogContentStyle }}>
        <DialogContentText id="safari-storage-description">
          Safari no permite guardar cookies o datos locales de TDDLab. Revisa
          estos ajustes para poder iniciar sesión y usar la aplicación.
        </DialogContentText>
        <Box component="ol" sx={{ pl: 3, "& > li": { pl: 1, my: 2 } }}>
          <li>
            <Typography>
              <strong>Abre los ajustes de Safari.</strong>
              <br />
              macOS: Safari → Configuración (o Preferencias).
              <br />
              iPhone o iPad: Configuración → Apps → Safari (o Configuración →
              Safari).
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Busca Privacidad.</strong>
              <br />
              En macOS, abre la pestaña Privacidad. En iOS, busca Privacidad y
              seguridad.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Permite guardar cookies.</strong>
              <br />
              Asegúrate de que “Bloquear todas las cookies” esté desactivado;
              según tu versión, está en Avanzado. Si el problema ocurre al
              iniciar sesión entre sitios, prueba desmarcar “Impedir seguimiento
              entre sitios” (Prevent cross-site tracking).
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Vuelve a TDDLab y pulsa Reintentar.</strong>
              <br />
              Comprobaremos los cambios y recargaremos la página si el
              almacenamiento está disponible.
            </Typography>
          </li>
        </Box>
        {retryFailed && (
          <Alert severity="warning">
            El almacenamiento sigue bloqueado. Revisa los ajustes y vuelve a
            reintentar.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={close} style={neutralButtonStyle}>
          Cerrar
        </Button>
        <Button variant="contained" onClick={retry} style={primaryButtonStyle}>
          Reintentar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
