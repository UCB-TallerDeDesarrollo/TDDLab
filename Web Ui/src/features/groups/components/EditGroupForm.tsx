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
import ValidationDialog from "../../../shared/components/ValidationDialog";

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
    } else {
      setGroupName("");
      setGroupDescription("");
    }
  }, [open, groupToEdit]);

  const formInvalid = () => groupName.trim() === "";

  const handleUpdate = async () => {
    setSave(true);
    if (formInvalid() || !groupToEdit) return;

    const updateGroupApp = new UpdateGroup(groupRepository);

    const payload = {
      ...groupToEdit,
      groupName,
      groupDetail: groupDescription,
    };

    try {
      await updateGroupApp.updateGroup(groupToEdit.id, payload);
      onUpdated?.(payload);
      setValidationDialogOpen(true);
    } catch (error) {
      console.error(error);
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