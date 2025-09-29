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
import { useNavigate } from "react-router-dom";

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
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

  const groupRepository = new GroupsRepository();
  const navigate = useNavigate();

  const formInvalid = () => groupName.trim() === "";

  const handleCancel = () => {
    handleClose();
    setGroupName("");
    setGroupDescription("");
  };

  const handleCreate = async () => {
    setSave(true);
    if (formInvalid()) return;

    const createGroup = new CreateGroup(groupRepository);
    const payload: GroupDataObject = {
      id: 0 as unknown as number, // el backend genera el id real
      groupName,
      groupDetail: groupDescription,
      creationDate: new Date(),
    };

    try {
      const newGroup = await createGroup.createGroup(payload);
      if (newGroup?.id) {
        localStorage.setItem("selectedGroup", String(newGroup.id));
        setLastCreatedId(newGroup.id);
      }
      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
    } finally {
      setSave(false);
    }
  };

  useEffect(() => {
    setSave(false);
  }, [open]);

  const handleSuccessClose = () => {
    setValidationDialogOpen(false);
    handleClose();
    const gid =
      lastCreatedId ?? Number(localStorage.getItem("selectedGroup") ?? NaN);

    if (Number.isFinite(gid)) {
      navigate(`/groups?groupId=${gid}`); // <- clave para que la lista sepa cuál marcar
    } else {
      navigate("/groups");
    }
  };

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
              helperText={
                formInvalid() && !!save ? "El nombre no puede estar vacío" : ""
              }
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
          onClose={handleSuccessClose}
        />
      )}
    </Dialog>
  );
};

export default CreateGroupPopup;
