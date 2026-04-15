import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField } from "@mui/material";
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
        console.error("La practica actual no se encontró.");
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };
  const getCurrentPractice = async () => {
    const practicesRepository = new PracticesRepository();
    try {
      const practice = await practicesRepository.getPracticeById(practiceId);
      return practice;
    } catch (error) {
      console.error("Error obteniendo la practica actual:", error);
      throw error;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Practica : {currentTitle}</DialogTitle>
      <DialogContent>
        <div className="flex-column gap-3 mt-4 mb-2">
          <TextField
            id="titulo"
            label="Título"
            variant="outlined"
            size="small"
            required
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
            defaultValue={currentTitle}
            sx={{
              marginTop: 2,
              "& .MuiInputBase-input": {
                paddingTop: "14px",
              },
            }}
          />
          <TextField
            id="descripcion"
            label="Descripcion"
            variant="outlined"
            size="small"
            required
            fullWidth
            multiline
            rows={5}
            onChange={(e) => setDescription(e.target.value)}
            defaultValue={currentDescription}
            sx={{ marginTop: 2 }}
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          variant="contained"
          color="error"
          onClick={onClose}
          sx={{
            flex: 1,
            borderRadius: "10px",
            paddingY: "10px",
            textTransform: "none",
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          sx={{
            flex: 1,
            borderRadius: "10px",
            paddingY: "10px",
            textTransform: "none",
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPracticeDialog;
