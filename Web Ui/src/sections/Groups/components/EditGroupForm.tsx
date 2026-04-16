import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ ...typographyVariants.h5, paddingBottom: 8 }}>Editar grupo</DialogTitle>
          <DialogContent>
            <Box className="flex-column gap-2 mt-2 mb-2">
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
              variant="outlined"
              InputProps={{ style: { borderRadius: "10px" } }}
              helperText={formInvalid() && !!save ? "El nombre del grupo no puede estar vacío" : ""}
            />
            <TextField
              multiline
              rows={4}
              margin="dense"
              id="edit-group-description"
              label="Descripción"
              type="text"
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              variant="outlined"
              InputProps={{ style: { borderRadius: "10px" } }}
            />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleClose} 
              variant="contained"
              color="error"
              sx={{
                flex: 1,
                borderRadius: "10px",
                paddingY: "10px",
                textTransform: "none",
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
              variant="contained"
              color="primary" 
              disabled={formInvalid()}
              sx={{
                flex: 1,
                borderRadius: "10px",
                paddingY: "10px",
                textTransform: "none",
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