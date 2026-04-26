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
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

interface EditGroupPopupProps {
  open: boolean;
  handleClose: () => void;
  groupToEdit: GroupDataObject | null;
  onUpdate: (data: {
    id: number;
    name: string;
    description: string;
  }) => Promise<void>;
}

const EditGroupPopup: React.FC<EditGroupPopupProps> = ({
  open,
  handleClose,
  groupToEdit,
  onUpdate,
}) => {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (open && groupToEdit) {
      setGroupName(groupToEdit.groupName);
      setGroupDescription(groupToEdit.groupDetail);
    } else {
      setGroupName("");
      setGroupDescription("");
    }
  }, [open, groupToEdit]);

  const formInvalid = () => groupName.trim() === "";

  const handleUpdate = async () => {
    setSave(true);
    if (formInvalid() || !groupToEdit) return;

    try {
      await onUpdate({
        id: groupToEdit.id,
        name: groupName,
        description: groupDescription,
      });

      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error al actualizar el grupo:", error);
    } finally {
      setSave(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen ? (
        <>
          <DialogTitle>Editar grupo</DialogTitle>

          <DialogContent>
            <TextField
              error={formInvalid() && save}
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
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleUpdate}>Guardar</Button>
          </DialogActions>
        </>
      ) : (
        <ValidationDialog
          open={validationDialogOpen}
          title="Grupo actualizado exitosamente"
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

export default EditGroupPopup;