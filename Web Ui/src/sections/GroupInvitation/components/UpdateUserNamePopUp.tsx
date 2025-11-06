import React, { useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";

interface UpdateUserNamePopUpProps {
  open: boolean;
  onClose: () => void;
  userId: string | number;
  currentName?: string;
  currentlastName?: string;
  setUser: (user: any) => void;
}

const UpdateUserNamePopUp: React.FC<UpdateUserNamePopUpProps> = ({
  open,
  onClose,
  userId,
  currentName,
  currentlastName,
  setUser,
}) => {
  const [name, setName] = useState(currentName || "");
  const [lastName, setLastName] = useState(currentlastName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !lastName.trim()) {
      setError("Nombre y apellido son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/${userId}`,
        { name, lastname: lastName },
        { withCredentials: true }
      );

      // Actualizamos el estado local/global del usuario
      if (response.data) {
        setUser((prev: any) => ({
          ...prev,
          name: response.data.name || name,
          lastname: response.data.lastname || lastName,
        }));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error al actualizar los datos:", err);
      setError("No se pudo actualizar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Actualiza tu información</DialogTitle>
      <DialogContent>
        {success ? (
          <Typography color="success.main">
            Datos actualizados correctamente 🎉
          </Typography>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Apellido"
              type="text"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      {!success && (
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Guardar"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UpdateUserNamePopUp;
