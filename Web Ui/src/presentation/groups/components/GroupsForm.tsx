import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Group } from "../types";

interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
  onCreate: (data: { name: string; description: string }) => Promise<void>;
  existingGroups?: Group[];
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({
  open,
  handleClose,
  onCreate,
  existingGroups = [],
}) => {
  const [save, setSave] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    handleClose();
    setGroupName("");
    setGroupDescription("");
    setError(null);
  };

  const formInvalid = () => groupName.trim() === "";

  const isDuplicate = () => {
    if (!groupName.trim()) return false;
    return existingGroups.some(
      (g) => g.name.trim().toLowerCase() === groupName.trim().toLowerCase()
    );
  };

  const handleCreate = async () => {
    setSave(true);
    setError(null);

    if (formInvalid()) {
      setSave(false);
      return;
    }

    if (isDuplicate()) {
      setError("Ya existe un grupo con ese nombre");
      setSave(false);
      return;
    }

    try {
      await onCreate({ name: groupName, description: groupDescription });
      // IMPORTANTE: NO llamar a handleClose() aquí.
      // El cierre lo controla el padre para poder mostrar el snackbar
      // DESPUÉS de que el dialog desaparezca y evitar el conflicto aria-hidden.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear el grupo";
      setError(message);
    } finally {
      setSave(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSave(false);
      setGroupName("");
      setGroupDescription("");
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Crear grupo</DialogTitle>
      <DialogContent>
        <TextField
          error={formInvalid() && !!save}
          autoFocus
          margin="dense"
          label="Nombre del grupo*"
          fullWidth
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          helperText={
            (formInvalid() && save
              ? "El nombre del grupo no puede estar vacío"
              : "") ||
            (isDuplicate() ? "Ya existe un grupo con este nombre" : "")
          }
        />
        <TextField
          multiline
          rows={4}
          margin="dense"
          label="Descripción"
          fullWidth
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />
        {error && (
          <TextField
            error
            fullWidth
            margin="dense"
            value={error}
            disabled
            variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { color: "#d32f2f" },
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={save}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          disabled={save || formInvalid() || isDuplicate()}
        >
          {save ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupPopup;
