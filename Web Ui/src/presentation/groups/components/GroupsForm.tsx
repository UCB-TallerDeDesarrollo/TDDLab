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
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import { useSnackbarFeedback } from "../../../shared/hooks/useSnackbarFeedback";

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
  const { snackbar, showSuccess, showError, handleClose: handleSnackbarClose } = useSnackbarFeedback();

  const handleCancel = () => {
    handleClose();
    setGroupName("");
    setGroupDescription("");
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

    if (formInvalid()) {
      setSave(false);
      return;
    }

    if (isDuplicate()) {
      showError("Ya existe un grupo con ese nombre");
      setSave(false);
      return;
    }

    try {
      await onCreate({ name: groupName, description: groupDescription });
      handleClose();
      showSuccess("Grupo creado exitosamente");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear el grupo";
      showError(message);
    } finally {
      setSave(false);
    }
  };

  const handleFeedbackClose = () => {
    handleSnackbarClose();
  };

  useEffect(() => {
    if (!open) {
      setSave(false);
      setGroupName("");
      setGroupDescription("");
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

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleFeedbackClose}
      />
    </Dialog>
  );
};

export default CreateGroupPopup;
