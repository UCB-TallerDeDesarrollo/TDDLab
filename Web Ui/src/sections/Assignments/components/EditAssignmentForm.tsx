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
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          description: description !== "" ? description : currentAssignment.description,
          groupid: selectedGroup !== 0 ? selectedGroup : currentAssignment.groupid,
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
        onClose();
        window.dispatchEvent(new CustomEvent('assignment-updated'));
      } else {
        console.error("La tarea actual no se encontró.");
      }
    } catch (error: any) {
      console.error("Error al guardar los cambios:", error);
      if (error.message.includes("Ya existe una tarea con el mismo nombre")) {
        setErrorMessage("Error: Ya existe una tarea con el mismo nombre en este grupo");
      } else if (
        error.message.includes("Limite de caracteres excedido") ||
        error.message.includes("Límite de caracteres excedido")
      ) {
        setErrorMessage("Error: Límite de caracteres excedido. El título no puede tener más de 50 caracteres.");
      } else {
        setErrorMessage("Error al actualizar la tarea: " + error.message);
      }
      setErrorOpen(true);
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

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="dialog-title-std">
        Editar Tarea : {currentTitle}
      </DialogTitle>
      
      <DialogContent className="dialog-content-box">
        {/* Selector de Grupo */}
        <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
          <InputLabel>Grupo</InputLabel>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            label="Grupo"
          >
            <MenuItem value={0}>{currentGroupName}</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.groupName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id="titulo"
          label="Título"
          variant="outlined"
          size="small"
          fullWidth
          required
          onChange={(e) => setTitle(e.target.value)}
          defaultValue={currentTitle}
        />

        <TextField
          id="descripcion"
          label="Descripción"
          variant="outlined"
          size="small"
          fullWidth
          required
          multiline
          rows={5}
          onChange={(e) => setDescription(e.target.value)}
          defaultValue={currentDescription}
        />
      </DialogContent>

      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="btn-std btn-cancel">
          Cancelar
        </Button>
        <Button
          onClick={handleSaveChanges}
          className="btn-std btn-primary"
        >
          Guardar Cambios
        </Button>
      </DialogActions>

      {/* Diálogo de error interno */}
      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
        <DialogTitle className="dialog-title-error">Error</DialogTitle>
        <DialogContent>
          <p className="dialog-error-text">{errorMessage}</p>
        </DialogContent>
        <DialogActions className="dialog-footer">
          <Button 
            variant="contained" 
            className="btn-std btn-primary" 
            onClick={() => setErrorOpen(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default EditAssignmentDialog;