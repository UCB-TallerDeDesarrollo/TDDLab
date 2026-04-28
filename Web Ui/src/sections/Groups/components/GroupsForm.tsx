import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import CreateGroup from "../../../modules/Groups/application/CreateGroup";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";

import "../../../App.css";

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
  const [errorToastOpen, setErrorToastOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

      try {
        const raw = localStorage.getItem("userGroups");
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && !arr.includes(newGroup.id)) {
            localStorage.setItem("userGroups", JSON.stringify([newGroup.id, ...arr]));
          }
        }
      } catch { /* ignore */ }

      onCreated?.(newGroup);
      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      const isDuplicate = (error as { response?: { status?: number } }).response?.status === 409;
      setErrorMessage(
        isDuplicate
          ? "Ya existe un grupo con ese nombre."
          : "No se pudo crear el grupo. Intenta nuevamente."
      );
      setErrorToastOpen(true);
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle className="dialog-title-std">Crear un Grupo</DialogTitle>

          <DialogContent className="dialog-content-box">
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
              helperText={formInvalid() && !!save ? "El nombre del grupo es requerido" : ""}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="group-description"
              name="groupDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
          </DialogContent>

          <DialogActions className="dialog-footer">
            {/* Outline rojo — igual que ConfirmationDialog */}
            <Button onClick={handleCancel} className="btn-std btn-secondary">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="btn-std btn-primary">
              Crear
            </Button>
          </DialogActions>
        </>
      )}

      <ValidationDialog
        open={validationDialogOpen}
        title="Grupo creado exitosamente"
        closeText="Cerrar"
        onClose={() => {
          setValidationDialogOpen(false);
          handleClose();
        }}
      />

      <Snackbar
        open={errorToastOpen}
        autoHideDuration={4000}
        onClose={() => setErrorToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorToastOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreateGroupPopup;
