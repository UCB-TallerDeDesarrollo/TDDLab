import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { UpdateGroup } from "../../../modules/Groups/application/UpdateGroup";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import "../../../App.css";

const EditGroupPopup: React.FC<{
  open: boolean;
  handleClose: () => void;
  groupToEdit: any;
  onUpdated?: (g: any) => void;
}> = ({ open, handleClose, groupToEdit, onUpdated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  useEffect(() => {
    if (open && groupToEdit) {
      setGroupName(groupToEdit.groupName);
      setGroupDescription(groupToEdit.groupDetail);
    }
  }, [open, groupToEdit]);

  const handleUpdate = async () => {
    if (!groupName.trim() || !groupToEdit) return;
    try {
      const repo = new GroupsRepository();
      const updater = new UpdateGroup(repo);
      const payload = { ...groupToEdit, groupName, groupDetail: groupDescription };
      await updater.updateGroup(groupToEdit.id, payload);
      onUpdated?.(payload);
      setValidationDialogOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle className="dialog-title-std">Editar grupo</DialogTitle>

          <DialogContent className="dialog-content-box">
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del grupo*"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              label="Descripción"
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
          </DialogContent>

          <DialogActions className="dialog-footer">
            {/* Outline rojo — consistente con el resto de formularios */}
            <Button onClick={handleClose} className="btn-std btn-danger-outline">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="btn-std btn-primary">
              Guardar Cambios
            </Button>
          </DialogActions>
        </>
      )}

      <ValidationDialog
        open={validationDialogOpen}
        title="Grupo actualizado exitosamente"
        closeText="Cerrar"
        onClose={() => {
          setValidationDialogOpen(false);
          handleClose();
        }}
      />
    </Dialog>
  );
};

export default EditGroupPopup;
