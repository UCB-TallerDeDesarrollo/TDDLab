import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";

interface EditAssignmentDialogProps {
  readonly assignmentId: number;
  readonly onClose: () => void;
}

function EditAssignmentDialog({
  assignmentId,
  onClose,
}: EditAssignmentDialogProps) {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Tarea - ID: {assignmentId}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            id="titulo"
            label="Titulo"
            variant="outlined"
            size="small"
            required
            value=""
            onChange={() => {}}
          />
          <TextField
            id="descripcion"
            label="Descripcion"
            variant="outlined"
            size="small"
            required
            sx={{
              "& label.Mui-focused": {
                color: "#001F3F",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#001F3F",
                },
              },
            }}
            onChange={() => {}}
            defaultValue=""
          />
          <section>{/* The rest of your components go here */}</section>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          style={{
            textTransform: "none",
          }}
          onClick={() => {}}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditAssignmentDialog;
