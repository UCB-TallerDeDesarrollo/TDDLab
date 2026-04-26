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
import ValidationDialog from "../../../shared/components/ValidationDialog";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";

interface CreateGroupPopupProps {
  open: boolean;
  handleClose: () => void;
  onCreated?: (group: GroupDataObject) => void;
}

const CreateGroupPopup: React.FC<CreateGroupPopupProps> = ({
  open,
  handleClose,
  onCreated,
}) => {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const groupRepository = new GroupsRepository();

  const [auth] = useGlobalState("authData");
  const dbAuthPort = new RegisterUserOnDb();

  const handleCancel = () => {
    handleClose();
    setGroupName("");
    setGroupDescription("");
  };

  const formInvalid = () => groupName.trim() === "";

  const handleCreate = async () => {
    setSave(true);
    if (formInvalid()) return;

    const createGroup = new CreateGroup(groupRepository);

    const payload: GroupDataObject = {
      id: 0 as unknown as number,
      groupName,
      groupDetail: groupDescription,
      creationDate: new Date(),
    };

    try {
      const newGroup = await createGroup.createGroup(payload);

      if (auth?.userEmail) {
        await dbAuthPort.register({
          email: auth.userEmail,
          groupid: newGroup.id,
          role: "teacher",
        });
      }

      onCreated?.(newGroup);
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