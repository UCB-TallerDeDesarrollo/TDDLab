import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";
import { useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface EditAssignmentDialogProps {
  readonly assignmentId: number;
  readonly currentGroupName: number; // Agrega una propiedad para el nombre del grupo actual
  //readonly assignmentGroupId: number;
  //readonly groups: { id: number; groupName: string }[];
  readonly onClose: () => void;
}


function EditAssignmentDialog({
  assignmentId,
  currentGroupName,
  //assignmentGroupId,
  //groups,
  onClose,
}: EditAssignmentDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<number>(0);

  const handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedGroup(event.target.value as number);
  };

  // const [selectedGroup, setSelectedGroup] = useState(assignmentGroupId);

  // const handleGroupChange = (event: SelectChangeEvent<number>) => {
  //   const selectedValue = parseInt(event.target.value as string, 10);
  //   setSelectedGroup(selectedValue);
  // };

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
          {
            <Select
            label="Grupos"
            value={selectedGroup}
            onChange={handleGroupChange}
            variant="outlined"
            size="small"
            required
          >
            <MenuItem value={0}>{currentGroupName}</MenuItem>
            <MenuItem value={1}>Grupo 1</MenuItem>
            <MenuItem value={2}>Grupo 2</MenuItem>
            <MenuItem value={3}>Grupo 3</MenuItem>
            {/* Agrega más elementos de menú según tus grupos */}
          </Select>
          /* <section>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="group-select" id="group-select-label">
                Grupo
              </InputLabel>
              <Select
                id="group-select"
                value={selectedGroup}
                onChange={handleGroupChange} // Usa el manejador de eventos correcto
                label="Grupo"
                fullWidth
                style={{ visibility: 'visible' }}
              >
                <MenuItem value={0}>Selecciona un grupo</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </section> */}
          
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
