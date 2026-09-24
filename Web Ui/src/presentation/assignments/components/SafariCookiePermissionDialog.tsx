import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

interface SafariCookiePermissionDialogProps {
  onClose: () => void;
  open: boolean;
}

function SafariCookiePermissionDialog({
  onClose,
  open,
}: Readonly<SafariCookiePermissionDialogProps>) {
  const handleReload = () => {
    globalThis.location.reload();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Habilita cookies para ver tus tareas</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Safari puede estar bloqueando cookies o datos de sesión que TDDLab
          necesita para cargar tus grupos y tareas.
        </DialogContentText>
        <List dense>
          <ListItem>
            <ListItemText primary="Abre la configuración de Safari para este sitio." />
          </ListItem>
          <ListItem>
            <ListItemText primary='Permite cookies y desactiva "Evitar rastreo entre sitios" si está bloqueando TDDLab.' />
          </ListItem>
          <ListItem>
            <ListItemText primary="Recarga la página y vuelve a entrar a Tareas." />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Entendido</Button>
        <Button variant="contained" onClick={handleReload}>
          Recargar página
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SafariCookiePermissionDialog;
