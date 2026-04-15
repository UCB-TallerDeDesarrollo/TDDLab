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
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { UpdateGroup } from "../../../modules/Groups/application/UpdateGroup";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import { typographyVariants } from "../../../styles/typography";

interface EditGroupPopupProps {
  open: boolean;
  handleClose: () => void;
  groupToEdit: GroupDataObject | null;
  onUpdated?: (group: GroupDataObject) => void;
}

const EditGroupPopup: React.FC<EditGroupPopupProps> = ({
  open,
  handleClose,
  groupToEdit,
  onUpdated,
}) => {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  
  const groupRepository = new GroupsRepository();

  useEffect(() => {
    if (open && groupToEdit) {
      setGroupName(groupToEdit.groupName);
      setGroupDescription(groupToEdit.groupDetail);
    } else if (!open) {
      setSave(false);
      setValidationDialogOpen(false);
      setGroupName("");
      setGroupDescription("");
    }
  }, [open, groupToEdit]);

  const formInvalid = () => groupName.trim() === "";

  const handleUpdate = async () => {
    setSave(true);
    if (formInvalid() || !groupToEdit) return;

    const updateGroupApp = new UpdateGroup(groupRepository);
    
    const payload: GroupDataObject = {
      ...groupToEdit,
      groupName,
      groupDetail: groupDescription,
    };

    try {
      await updateGroupApp.updateGroup(groupToEdit.id, payload);
      onUpdated?.(payload);
      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error al actualizar el grupo:", error);
    } finally {
      setSave(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ ...typographyVariants.h5 }}>Editar grupo</DialogTitle>
          <DialogContent>
            <TextField
              error={formInvalid() && !!save}
              autoFocus
              margin="dense"
              id="edit-group-name"
              label="Nombre del grupo*"
              type="text"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              InputLabelProps={{ style: { ...typographyVariants.paragraphMedium } }}
              helperText={formInvalid() && !!save ? "El nombre del grupo no puede estar vacío" : ""}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="edit-group-description"
              label="Descripcion"
              type="text"
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              InputLabelProps={{ style: { ...typographyVariants.paragraphMedium } }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClose} 
              sx={{
                color: "#555",
                textTransform: "none",
                ...typographyVariants.paragraphMedium,
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate} 
              color="primary" 
              sx={{
                textTransform: "none",
                ...typographyVariants.paragraphMedium,
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
              }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </>
      )}

      {validationDialogOpen && (
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