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
import "../../App.css";

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
      <DialogTitle className="dialog-title-std">
        Editar Practica : {currentTitle}
      </DialogTitle>
      <DialogContent className="dialog-content-box">
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
          label="Descripcion"
          variant="outlined"
          size="small"
          required
          multiline
          rows = {5}
          onChange={(e) => setDescription(e.target.value)}
          defaultValue={currentDescription}
        />
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="btn-std btn-cancel">
          Cancelar
        </Button>
        <Button onClick={handleSaveChanges} className="btn-std btn-primary">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPracticeDialog;
