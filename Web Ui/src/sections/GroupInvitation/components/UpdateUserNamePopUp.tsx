import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";

interface UpdateUserNamePopUpProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  currentFirstName?: string;
  currentLastName?: string;
  setUser: (updateFn: (prev: any) => any) => void;
}

const UpdateUserNamePopUp: React.FC<UpdateUserNamePopUpProps> = ({
  open,
  onClose,
  userId,
  currentFirstName,
  currentLastName,
  setUser,
}) => {
  const [firstName, setFirstName] = useState(currentFirstName || "");
  const [lastName, setLastName] = useState(currentLastName || "");
  const [isLoading, setIsLoading] = useState(false);
  const usersRepo = new UsersRepository();

  useEffect(() => {
    setFirstName(currentFirstName || "");
    setLastName(currentLastName || "");
  }, [currentFirstName, currentLastName]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setIsLoading(true);
    try {
      await usersRepo.updateUserById(userId, { firstName, lastName });
      setUser((prev) => prev ? { ...prev, displayName: `${firstName} ${lastName}` } : prev);
      onClose();
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error.response?.status === 403) {
        alert("Todavía hay problemas de permisos. Contacta al administrador.");
      } else if (error.response?.status === 404) {
        alert("Endpoint no encontrado. Verifica la URL del servicio.");
      } else {
        alert("Error al actualizar los datos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={(reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }} 
      disableEscapeKeyDown={true}
      >
      <DialogTitle>Completa tu registro</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre"
          fullWidth
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isLoading}
          error={!firstName.trim()}
          helperText={!firstName.trim() ? "El nombre es requerido" : ""}
        />
        <TextField
          margin="dense"
          label="Apellido"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={isLoading}
          error={!lastName.trim()}
          helperText={!lastName.trim() ? "El apellido es requerido" : ""}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isLoading || !firstName.trim() || !lastName.trim()}
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserNamePopUp;