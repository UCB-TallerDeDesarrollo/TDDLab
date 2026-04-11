import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { UpdateAssignment } from "../../../modules/Assignments/application/UpdateAssignment";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";

interface EditAssignmentDialogProps {
  readonly assignmentId: number;
  readonly currentGroupName: string;
  readonly currentTitle: string;
  readonly currentDescription: string;
  readonly onClose: () => void;
}

function EditAssignmentDialog({
  assignmentId,
  currentGroupName,
  currentTitle,
  currentDescription,
  onClose,
}: EditAssignmentDialogProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);

  // Estado unificado para el dialog de validación (éxito y error)
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    setSelectedGroup(event.target.value as number);
  };

  const groupRepository = new GroupsRepository();
  const [groups, setGroups] = useState<GroupDataObject[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      const allGroups = await getGroups.getGroups();
      setGroups(allGroups);
    };
    fetchGroups();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const currentAssignment = await getCurrentAssignment();
      if (currentAssignment) {
        const updatedAssignmentData: AssignmentDataObject = {
          title: title !== "" ? title : currentAssignment.title,
          description:
            description !== "" ? description : currentAssignment.description,
          groupid:
            selectedGroup !== 0 ? selectedGroup : currentAssignment.groupid,
          id: currentAssignment.id,
          start_date: currentAssignment.start_date,
          end_date: currentAssignment.end_date,
          state: currentAssignment.state,
          link: currentAssignment.link,
          comment: currentAssignment.comment,
        };
        const assignmentsRepository = new AssignmentsRepository();
        const updateAssignment = new UpdateAssignment(assignmentsRepository);
        await updateAssignment.updateAssignment(assignmentId, updatedAssignmentData);

        // Éxito — mostramos dialog verde antes de cerrar
        setIsError(false);
        setValidationMessage("Tarea actualizada exitosamente");
        setValidationOpen(true);
      } else {
        console.error("La tarea actual no se encontró.");
      }
    } catch (error: any) {
      console.error("Error al guardar los cambios:", error);
      if (error.message.includes("Ya existe una tarea con el mismo nombre")) {
        setValidationMessage("Error: Ya existe una tarea con el mismo nombre en este grupo");
      } else if (
        error.message.includes("Limite de caracteres excedido") ||
        error.message.includes("Límite de caracteres excedido")
      ) {
        setValidationMessage("Error: Límite de caracteres excedido. El título no puede tener más de 50 caracteres.");
      } else {
        setValidationMessage("Error al actualizar la tarea: " + error.message);
      }
      setIsError(true);
      setValidationOpen(true);
    }
  };

  const getCurrentAssignment = async () => {
    const assignmentsRepository = new AssignmentsRepository();
    try {
      return await assignmentsRepository.getAssignmentById(assignmentId);
    } catch (error) {
      console.error("Error obteniendo la tarea actual:", error);
      throw error;
    }
  };

  const handleValidationClose = () => {
    setValidationOpen(false);
    if (!isError) {
      // Solo cerramos el form y disparamos el evento si fue éxito
      window.dispatchEvent(new CustomEvent("assignment-updated"));
      onClose();
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="dialog-title-std">
        Editar Tarea: {currentTitle}
      </DialogTitle>

      <DialogContent className="dialog-content-box">
        <FormControl fullWidth variant="outlined" margin="dense">
          <InputLabel htmlFor="group-select" style={{ fontSize: "0.95rem" }}>
            Grupo
          </InputLabel>
          <Select
            id="group-select"
            value={selectedGroup}
            onChange={handleGroupChange}
            label="Grupo"
          >
            <MenuItem value={0}>{currentGroupName}</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.groupName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id="titulo"
          label="Título"
          margin="dense"
          fullWidth
          required
          onChange={(e) => setTitle(e.target.value)}
          defaultValue={currentTitle}
          InputLabelProps={{ style: { fontSize: "0.95rem" } }}
        />

        <TextField
          id="descripcion"
          label="Descripción"
          margin="dense"
          fullWidth
          required
          multiline
          rows={3.7}
          onChange={(e) => setDescription(e.target.value)}
          defaultValue={currentDescription}
          InputLabelProps={{ style: { fontSize: "0.95rem" } }}
        />
      </DialogContent>

      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="btn-std btn-danger-outline">
          Cancelar
        </Button>
        <Button onClick={handleSaveChanges} className="btn-std btn-primary">
          Guardar Cambios
        </Button>
      </DialogActions>

      <ValidationDialog
        open={validationOpen}
        title={validationMessage}
        isError={isError}
        closeText="Cerrar"
        onClose={handleValidationClose}
      />
    </Dialog>
  );
}

export default EditAssignmentDialog;
