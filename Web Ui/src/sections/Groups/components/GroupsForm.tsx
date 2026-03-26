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
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";

// Importamos el CSS global para que las clases funcionen
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

      // Actualización de localStorage para consistencia
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
          {/* Título con estilo estándar */}
          <DialogTitle className="dialog-title-std">
            Crear un Grupo
          </DialogTitle>
          
          {/* Contenido con espaciado grid estándar */}
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

          {/* Footer con botones alineados y estilos de Prácticas */}
          <DialogActions className="dialog-footer">
            <Button onClick={handleCancel} className="btn-std btn-danger">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="btn-std btn-primary">
              Crear
            </Button>
          </DialogActions>
        </>
      )}

      {validationDialogOpen && (
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