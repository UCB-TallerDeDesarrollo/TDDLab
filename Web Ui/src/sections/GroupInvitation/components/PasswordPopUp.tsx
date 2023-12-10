import React, { useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

interface PasswordComponentProps {
  open: boolean;
  onSend: (pass: string) => void;
  onClose: () => void;
}

const PasswordComponent: React.FC<PasswordComponentProps> = ({
  open,
  onClose,
  onSend,
}) => {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSendPassword = async () => {
    onSend(password);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Ingrese la Contraseña</DialogTitle>
      <DialogContent>
        <TextField
          label="contraseña"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSendPassword} color="primary">
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordComponent;
