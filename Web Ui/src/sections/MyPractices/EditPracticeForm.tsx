import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";
import { useState } from "react";
import { UpdatePractice } from "../../modules/Practices/application/UpdatePractice";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";

interface EditPracticeDialogProps {
  readonly practiceId: number;
  readonly currentTitle: string;
  readonly currentDescription: string;
  readonly onClose: () => void;
}

function EditPracticeDialog({
  practiceId,
  currentTitle,
  currentDescription,
  onClose,
}: EditPracticeDialogProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSaveChanges = async () => {
    try {
      const currentPractice = await getCurrentPractice();

      if (currentPractice) {
        const updatedPracticeData: PracticeDataObject = {
          title: title !== "" ? title : currentPractice.title,
          description:
            description !== "" ? description : currentPractice.description,
          id: currentPractice.id,
          state: currentPractice.state,
          creation_date: currentPractice.creation_date,
          userid: currentPractice.userid,
        };

        const practiceRepository = new PracticesRepository();
        const updatePractice = new UpdatePractice(practiceRepository);
        await updatePractice.updatePractice(practiceId, updatedPracticeData);

        onClose();
        window.location.reload();
      } else {
        console.error("La practice actual no se encontró.");
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };
  const getCurrentPractice = async () => {
    const practicesRepository = new PracticesRepository();
    try {
      const assignment = await practicesRepository.getPracticeById(practiceId);
      return assignment;
    } catch (error) {
      console.error("Error obteniendo la tarea actual:", error);
      throw error;
    }
  };

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
            onChange={(e) => setTitle(e.target.value)}
            defaultValue={currentTitle}
          />
          <TextField
            id="descripcion"
            label="Descripción"
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
            onChange={(e) => setDescription(e.target.value)}
            defaultValue={currentDescription}
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
          onClick={handleSaveChanges} // Asocia la función handleSaveChanges al evento onClick del botón
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPracticeDialog;
