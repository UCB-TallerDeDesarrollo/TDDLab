import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import ValidationDialog from "../../../shared/components/ValidationDialog";

interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
  onCreate: (data: { name: string; description: string }) => Promise<void>;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({
  open,
  handleClose,
  onCreate,
}) => {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCancel = () => {
    handleClose();
    setGroupName("");
    setGroupDescription("");
  };

  const formInvalid = () => groupName.trim() === "";

  const handleCreate = async () => {
    setSave(true);
    if (formInvalid()) return;

    try {
      await onCreate({
        name: groupName,
        description: groupDescription,
      });

      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
    } finally {
      setSave(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSave(false);
      setValidationDialogOpen(false);
      setGroupName("");
      setGroupDescription("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen ? (
        <>
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
                formInvalid() && save
                  ? "El nombre del grupo no puede estar vacío"
                  : ""
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
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogActions>
        </>
      ) : (
        <ValidationDialog
          open={validationDialogOpen}
          title="Grupo creado exitosamente"
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
            handleClose();
          }}
        />
      )}
    </Dialog>
  );
};

export default CreateGroupPopup;