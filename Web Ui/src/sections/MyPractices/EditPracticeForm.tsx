import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";
import { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";

interface EditPracticeDialogProps {
  readonly practiceId: number;
  readonly currentTitle: string;
  readonly currentDescription: string;
  readonly onClose: () => void;
  readonly onPracticeUpdated: (practice: PracticeDataObject) => Promise<void>;
}

function EditPracticeDialog({
  practiceId,
  currentTitle,
  currentDescription,
  onClose,
  onPracticeUpdated,
}: EditPracticeDialogProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
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

        await onPracticeUpdated(updatedPracticeData);
        setValidationMessage("Practica actualizada exitosamente");
        setValidationDialogOpen(true);
      } else {
        console.error("La practica actual no se encontró.");
        setValidationMessage("Error al actualizar la practica");
        setValidationDialogOpen(true);
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      setValidationMessage("Error al actualizar la practica");
      setValidationDialogOpen(true);
    } finally {
      setIsSaving(false);
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
        <Box sx={{ display: "grid", gap: 2, marginTop: 2 }}>
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          style={{
            textTransform: "none",
          }}
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
      <ValidationDialog
        open={validationDialogOpen}
        title={validationMessage}
        closeText="Cerrar"
        onClose={() => {
          setValidationDialogOpen(false);
          if (!validationMessage.toLowerCase().includes("error")) {
            onClose();
          }
        }}
      />
    </Dialog>
  );
}

export default EditPracticeDialog;
