import Button from "@mui/material/Button";
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Filter from "./DatePicker";
import ValidationDialog from "./ValidationDialog";
import { useAssignmentForm } from "../hooks/useAssignmentForm";
import { useGroups } from "../hooks/useGroups";
import { styles } from "../styles/Form.styles";

/**
 * Este componente es un formulario para crear una Tarea
 */
interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
  groupid: number;
}

function Form({ open, handleClose, groupid }: Readonly<CreateAssignmentPopupProps>) {
  const { groups } = useGroups(open);

  const {
    save,
    assignmentData,
    validationDialogOpen,
    validationMessage,
    formInvalid,
    handleInputChange,
    handleGroupChange,
    handleUpdateDates,
    handleCancel,
    handleSaveClick,
    handleValidationClose,
  } = useAssignmentForm({ open, groupid, groups, handleClose });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={styles.form.dialogTitle}>Crear tarea</DialogTitle>
          <DialogContent>
            <section className="mb-4">
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="group-select">Grupo</InputLabel>
                <Select
                  id="group-select"
                  value={assignmentData.groupid}
                  onChange={handleGroupChange}
                  label="Grupo"
                  error={save && assignmentData.groupid === 0}
                >
                  <MenuItem value={0}>Selecciona un grupo</MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </section>

            <TextField
              error={save && !assignmentData.title.trim()}
              helperText={save && !assignmentData.title.trim() ? "El título es requerido" : ""}
              autoFocus
              margin="dense"
              id="assignment-title"
              name="assignmentTitle"
              label="Nombre de la Tarea*"
              type="text"
              fullWidth
              value={assignmentData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />

            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="assignment-description"
              name="assignmentDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={assignmentData.description}
              onChange={(e) => handleInputChange(e, "description")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />

            <section className="mt-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Filter onUpdateDates={handleUpdateDates} />
              </LocalizationProvider>
            </section>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCancel} style={styles.form.cancelButton}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              color="primary"
              style={styles.form.createButton}
              disabled={formInvalid()}
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}

      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title={validationMessage}
          closeText="Cerrar"
          onClose={handleValidationClose}
        />
      )}
    </Dialog>
  );
}

export default Form;