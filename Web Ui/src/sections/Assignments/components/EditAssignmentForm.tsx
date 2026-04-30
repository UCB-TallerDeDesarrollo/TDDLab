import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField, MenuItem, Select } from "@mui/material";
import { useEditAssignmentForm } from "../hooks/useEditAssignmentForm";
import { useGroups } from "../hooks/useGroups";
import { editAssignmentStyles as styles } from "../styles/EditAssignmentForm.styles";

/**
 * Componente form para editar una tarea
 */
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
  const {
    selectedGroup,
    errorOpen,
    errorMessage,
    setTitle,
    setDescription,
    setErrorOpen,
    handleGroupChange,
    handleSaveChanges,
  } = useEditAssignmentForm({ assignmentId, onClose });

  const { groups } = useGroups(true);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Tarea : {currentTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            id="titulo"
            label="Título"
            variant="outlined"
            size="small"
            required
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
            defaultValue={currentTitle}
            sx={styles.titleField}
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
            sx={styles.descriptionField}
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
              <MenuItem key={group.id} value={group.id}>
                {group.groupName}
              </MenuItem>
            ))}
          </Select>

          <section />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          style={styles.saveButton}
          onClick={handleSaveChanges}
        >
          Guardar Cambios
        </Button>
      </DialogActions>

      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
        <DialogTitle style={styles.errorTitle}>Error</DialogTitle>
        <DialogContent>
          <p style={styles.errorMessage}>{errorMessage}</p>
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