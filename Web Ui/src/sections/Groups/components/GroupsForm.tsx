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
import CreateGroup from "../../../modules/Groups/application/CreateGroup";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";
import { typographyVariants } from "../../../styles/typography";


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
      // avisa al padre
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
      } catch {
        // ignore
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ ...typographyVariants.h5, paddingBottom: 8 }}>Crear grupo</DialogTitle>
          <DialogContent>
            <Box className="flex-column gap-2 mt-2 mb-2">
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
              variant="outlined"
              InputProps={{ style: { borderRadius: "10px" } }}
              helperText={formInvalid() && !!save ? "El nombre del grupo no puede estar vacío" : ""}
            />
            <TextField
              multiline
              rows={4}
              margin="dense"
              id="group-description"
              name="groupDescription"
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
              onClick={handleCancel} 
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
              onClick={handleCreate} 
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
            handleClose(); // cierra el popup después de mostrar el mensaje
          }}
        />
      )}
    </Dialog>
  );
};

export default CreateGroupPopup;
