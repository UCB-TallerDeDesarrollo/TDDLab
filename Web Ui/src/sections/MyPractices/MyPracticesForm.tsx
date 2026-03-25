import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";

interface CreatePracticePopupProps {
  open: boolean;
  handleClose: () => void;
  userid: number;
  isSaving: boolean;
  onCreate: (input: { title: string; description: string; userid: number }) => Promise<void>;
}

function MyPracticesForm({
  open,
  handleClose,
  userid,
  isSaving,
  onCreate,
}: Readonly<CreatePracticePopupProps>) {
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("Practica creada exitosamente");
  const [practiceData, setPracticeData] = useState({
    title: "",
    description: "",
    userid: userid,
  });

  const handleSaveClick = async () => {
    setSaveAttempted(true);
    if (formInvalid()) {
      return;
    }

    try {
      await onCreate(practiceData);
      setValidationMessage("Practica creada exitosamente");
      setValidationDialogOpen(true);
    } catch (error) {
      console.error(error);
      setValidationMessage("Error al crear la practica");
      setValidationDialogOpen(true);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;

    setPracticeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const formInvalid = () => {
    return practiceData.title.trim() === "";
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setSaveAttempted(false);
    setValidationDialogOpen(false);
    setPracticeData({
      title: "",
      description: "",
      userid,
    });
  }, [open, userid]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ fontSize: "0.8 rem" }}>
            Crear una Practica
          </DialogTitle>
          <DialogContent>
            <TextField
              error={saveAttempted && formInvalid()}
              autoFocus
              margin="dense"
              id="assigment-title"
              name="practiceTitle"
              label="Nombre de la Practica*"
              type="text"
              fullWidth
              value={practiceData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="practice-description"
              name="practiceDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={practiceData.description}
              onChange={(e) => handleInputChange(e, "description")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancel}
              style={{ color: "#555", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              color="primary"
              style={{ textTransform: "none" }}
              disabled={isSaving || formInvalid()}
            >
              {isSaving ? "Creando..." : "Crear"}
            </Button>
          </DialogActions>
        </>
      )}
      {!!validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title={validationMessage}
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
            if (!validationMessage.toLowerCase().includes("error")) {
              handleClose();
            }
          }}
        />
      )}
    </Dialog>
  );
}

export default MyPracticesForm;
