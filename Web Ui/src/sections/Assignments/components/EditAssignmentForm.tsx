import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField, MenuItem, Select } from "@mui/material";
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
      {/* CAMBIO 1: sin cambios en DialogTitle principal */}
      <DialogTitle>Editar Tarea : {currentTitle}</DialogTitle>
      {/* CAMBIO 2: className="dialog-content-box" reemplaza sx={{ display: "grid", gap: 2 }} */}
      <DialogContent>
        <Box className="dialog-content-box">
          <TextField
            id="titulo"
            label="Título"
            variant="outlined"
            size="small"
            required
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
            defaultValue={currentTitle}
            sx={{ marginTop: 2, "& .MuiInputBase-input": { paddingTop: "14px" } }}
          />
          <TextField
            id="descripcion"
            label="Descripción"
            variant="outlined"
            size="small"
            required
            multiline
            fullWidth
            rows={4}
            sx={{
              "& label.Mui-focused": { color: "#001F3F" },
              "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#001F3F" } },
            }}
            onChange={(e) => setDescription(e.target.value)}
            defaultValue={currentDescription}
          />
          <Select
            label="Grupos"
            value={selectedGroup}
            onChange={handleGroupChange}
            variant="outlined"
            size="small"
            required
          >
            <MenuItem value={0}>{currentGroupName}</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.groupName}</MenuItem>
            ))}
          </Select>
          <section />
        </Box>
      </DialogContent>
      <DialogActions>
        {/* CAMBIO 3: botones sin style inline → btn-std cubre textTransform */}
        <Button className="btn-std" onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          className="btn-std btn-primary"
          onClick={handleSaveChanges}
        >
          Guardar Cambios
        </Button>
      </DialogActions>

      {/* Diálogo de error interno */}
      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
        {/*
          CAMBIO 4: style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '18px' }}
          → className="dialog-title-error" (definida en App.css)
        */}
        <DialogTitle className="dialog-title-error">Error</DialogTitle>
        <DialogContent>
          {/*
            CAMBIO 5: style={{ color/fontWeight/fontSize/textAlign }} inline en <p>
            → className="dialog-error-text" (definida en App.css)
          */}
          <p className="dialog-error-text">{errorMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setErrorOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default EditAssignmentDialog;
