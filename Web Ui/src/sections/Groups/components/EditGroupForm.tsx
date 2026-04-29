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
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { normalizeTextForComparison } from "../../../utils/normalizeText";
import "../../../App.css";

const EditGroupPopup: React.FC<{
  open: boolean;
  handleClose: () => void;
  existingGroups: any[];
  groupToEdit: any;
  onUpdated?: (g: any) => void;
}> = ({ open, handleClose, existingGroups, groupToEdit, onUpdated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [auth] = useGlobalState("authData");

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
      if (auth?.userRole === "teacher") {
        const duplicateGroup = existingGroups.find(
          (group) =>
            group.id !== groupToEdit.id &&
            normalizeTextForComparison(group.groupName) ===
              normalizeTextForComparison(groupName)
        );

        if (duplicateGroup) {
          setIsError(true);
          setValidationMessage(
            "Error: Ya existe un grupo con ese nombre para este docente"
          );
          setValidationDialogOpen(true);
          return;
        }
      }

      const payload = { ...groupToEdit, groupName, groupDetail: groupDescription };
      await updater.updateGroup(groupToEdit.id, payload);
      onUpdated?.(payload);
      setIsError(false);
      setValidationMessage("Grupo actualizado exitosamente");
      setValidationDialogOpen(true);
    } catch (e) {
      console.error(e);
      setIsError(true);
      setValidationMessage("Error al actualizar el grupo");
      setValidationDialogOpen(true);
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
            <Button onClick={handleClose} className="btn-std btn-secondary">
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
        title={validationMessage}
        isError={isError}
        closeText="Cerrar"
        onClose={() => {
          setValidationDialogOpen(false);
          if (!isError) {
            handleClose();
          }
        }}
      />
    </Dialog>
  );
};

export default EditGroupPopup;
