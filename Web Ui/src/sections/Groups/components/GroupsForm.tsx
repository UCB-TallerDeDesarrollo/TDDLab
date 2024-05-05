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
import CreateGroup from "../../../modules/Groups/application/CreateGroup";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";

interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({
  open,
  handleClose,
}) => {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [groupId] = useState(Number);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const groupRepository = new GroupsRepository();

  const handleCancel = () => {
    handleClose();
  };

  const handleCreate = async () => {
    setSave(true);
    if (formInvalid()) {
      return;
    }

    const createGroup = new CreateGroup(groupRepository);
    const payload: GroupDataObject = {
      id: groupId,
      groupName: groupName,
      groupDetail: groupDescription,
      creationDate: new Date(),
    };
    try {
      await createGroup.createGroup(payload);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
    } finally {
      setSave(false);
    }
    setValidationDialogOpen(true);
  };

  const formInvalid = () => {
    return groupName === "";
  };

  useEffect(() => {
    setSave(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ fontSize: "0.8 rem" }}>Crear grupo</DialogTitle>
          <DialogContent>
            <TextField
              error={formInvalid() && !!save}
              autoFocus
              margin="dense"
              id="group-name"
              name="groupName"
              label="Nombre del grupo*"
              type="text"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="group-description"
              name="groupDescription"
              label="Descripcion"
              type="text"
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancel}
              style={{ color: "#555", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              color="primary"
              style={{ textTransform: "none" }}
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}
      {!!validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Grupo creado exitosamente"
          closeText="Cerrar"
          onClose={() => window.location.reload()}
        />
      )}
    </Dialog>
  );
};

export default CreateGroupPopup;
